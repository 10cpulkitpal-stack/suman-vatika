import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { createServer } from 'node:http'
import { initializeDatabase, isValidDate, dialect, query, placeholders } from './database.mjs'

const port = Number(process.env.PORT ?? 4000)
const host = process.env.HOST ?? (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
const cookieName = 'sv_admin_session'
const sessionLifetimeSeconds = 60 * 60 * 8
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000').split(',').map((value) => value.trim()).filter(Boolean)
const sessionSecret = process.env.ADMIN_SESSION_SECRET

if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid port number.')

function send(response, status, value, extraHeaders = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders })
  response.end(JSON.stringify(value))
}

function cors(request, response) {
  const origin = request.headers.origin
  if (origin && !allowedOrigins.includes(origin)) {
    send(response, 403, { error: 'Origin is not allowed.' })
    return false
  }
  if (origin) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Vary', 'Origin')
    response.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return true
}

async function readJson(request) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > 16_384) throw Object.assign(new Error('Request body is too large.'), { status: 413 })
  }
  try { return JSON.parse(body || '{}') } catch {
    throw Object.assign(new Error('Request body must be valid JSON.'), { status: 400 })
  }
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.cookie ?? ''
  for (const entry of cookieHeader.split(';')) {
    const separator = entry.indexOf('=')
    if (separator < 0) continue
    if (entry.slice(0, separator).trim() === name) return decodeURIComponent(entry.slice(separator + 1).trim())
  }
  return ''
}

function signature(expiresAt) {
  if (!sessionSecret || sessionSecret.length < 32) return ''
  return createHmac('sha256', sessionSecret).update(`suman-vatika-admin:${expiresAt}`).digest('base64url')
}

function isValidSession(value) {
  if (!sessionSecret || sessionSecret.length < 32 || !value) return false
  const [expiresAt, suppliedSignature, extra] = value.split('.')
  if (!expiresAt || !suppliedSignature || extra || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false
  const expected = Buffer.from(signature(expiresAt))
  const supplied = Buffer.from(suppliedSignature)
  return expected.length === supplied.length && timingSafeEqual(expected, supplied)
}

function isAdmin(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '') ?? ''
  const apiKey = process.env.ADMIN_API_KEY
  if (apiKey) {
    const expected = Buffer.from(apiKey)
    const supplied = Buffer.from(token)
    if (expected.length === supplied.length && timingSafeEqual(expected, supplied)) return true
  }
  return isValidSession(cookieValue(request, cookieName))
}

function adminFailure() {
  const configured = Boolean(process.env.ADMIN_API_KEY || (process.env.ADMIN_PASSWORD && sessionSecret && sessionSecret.length >= 32))
  return { status: configured ? 401 : 503, error: configured ? 'Unauthorized.' : 'Admin API is not configured.' }
}

function cookieOptions(maxAge) {
  const pieces = [`${cookieName}=`, 'HttpOnly', 'SameSite=Strict', 'Path=/api/admin', `Max-Age=${maxAge}`]
  if (process.env.NODE_ENV === 'production') pieces.push('Secure')
  return pieces.join('; ')
}

function validOrigin(request) {
  return !request.headers.origin || allowedOrigins.includes(request.headers.origin)
}

const server = createServer(async (request, response) => {
  if (!cors(request, response)) return
  if (request.method === 'OPTIONS') {
    response.writeHead(204)
    response.end()
    return
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`)
  const { pathname, searchParams } = url

  try {
    if (pathname === '/api/admin/session' && request.method === 'GET') {
      send(response, 200, { authenticated: isAdmin(request) })
      return
    }

    if (pathname === '/api/admin/session' && request.method === 'POST') {
      if (!validOrigin(request)) { send(response, 403, { error: 'Invalid request origin.' }); return }
      const password = process.env.ADMIN_PASSWORD
      if (!password || !sessionSecret || sessionSecret.length < 32) {
        send(response, 503, { error: 'Set ADMIN_PASSWORD and an ADMIN_SESSION_SECRET of at least 32 characters in the backend environment.' })
        return
      }
      const body = await readJson(request)
      const supplied = typeof body.password === 'string' ? body.password : ''
      const expected = Buffer.from(password)
      const provided = Buffer.from(supplied)
      if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
        send(response, 401, { error: 'That password was not accepted.' })
        return
      }
      const expiresAt = String(Math.floor(Date.now() / 1000) + sessionLifetimeSeconds)
      response.setHeader('Set-Cookie', `${cookieName}=${expiresAt}.${signature(expiresAt)}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${sessionLifetimeSeconds}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
      send(response, 200, { authenticated: true })
      return
    }

    if (pathname === '/api/admin/session' && request.method === 'DELETE') {
      if (!validOrigin(request)) { send(response, 403, { error: 'Invalid request origin.' }); return }
      response.setHeader('Set-Cookie', cookieOptions(0))
      send(response, 200, { authenticated: false })
      return
    }

    if (pathname === '/api/inquiries' && request.method === 'POST') {
      const body = await readJson(request)
      const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : ''
      const eventDate = text(body.date, 10)
      const eventType = text(body.event, 80)
      const guests = Number(body.guests)
      const space = text(body.space, 80)
      const name = text(body.name, 120)
      const phone = text(body.phone, 40)
      const contactPreference = text(body.contact_preference, 20)
      const email = text(body.email, 254)
      const budget = text(body.budget, 80)
      const note = text(body.note, 2000)
      if (!isValidDate(eventDate)) { send(response, 400, { error: 'Choose a valid event date.' }); return }
      if (!eventType || !space || !Number.isInteger(guests) || guests < 1 || guests > 800) {
        send(response, 400, { error: 'Add a celebration type, preferred space, and guest count from 1 to 800.' }); return
      }
      if (!name || !/^[+\d][\d ()-]{8,}$/.test(phone)) { send(response, 400, { error: 'Add your name and a valid WhatsApp number.' }); return }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { send(response, 400, { error: 'Enter a valid email address or leave it blank.' }); return }
      if (!['whatsapp', 'phone', 'email'].includes(contactPreference)) { send(response, 400, { error: 'Choose WhatsApp, phone call, or email as your preferred contact method.' }); return }
      if (contactPreference === 'email' && !email) { send(response, 400, { error: 'Add your email address to be contacted by email.' }); return }
      await initializeDatabase()
      const id = randomUUID()
      const now = new Date().toISOString()
      await query(`INSERT INTO inquiries (id, event_date, event_type, guest_count, preferred_space, name, phone, contact_preference, email, note, budget, status, created_at, updated_at) VALUES (${placeholders(14)})`,
        [id, eventDate, eventType, guests, space, name, phone, contactPreference, email || null, note, budget, 'new', now, now])
      send(response, 201, { id, status: 'new', message: 'Enquiry saved. This does not reserve the event date.' })
      return
    }

    if (pathname === '/api/availability' && request.method === 'GET') {
      const date = searchParams.get('date') ?? ''
      const space = searchParams.get('space') ?? ''
      if (!isValidDate(date) || !space || space.length > 80) { send(response, 400, { error: 'Provide a valid date and space.' }); return }
      await initializeDatabase()
      const rows = await query(`SELECT status FROM date_availability WHERE event_date = ${dialect === 'postgres' ? '$1' : '?'} AND space IN (${dialect === 'postgres' ? '$2, $3' : '?, ?'})`, [date, '*', space])
      const recordedStatuses = rows.map((row) => row.status)
      const status = recordedStatuses.includes('unavailable') ? 'unavailable' : recordedStatuses.includes('available') ? 'available' : 'unknown'
      send(response, 200, { date, space, status, reservesDate: false })
      return
    }

    if (pathname.startsWith('/api/admin/') && !isAdmin(request)) {
      const failure = adminFailure()
      send(response, failure.status, { error: failure.error })
      return
    }

    if (pathname === '/api/admin/inquiries' && request.method === 'GET') {
      await initializeDatabase()
      const inquiries = await query('SELECT id, event_date, event_type, guest_count, preferred_space, name, phone, contact_preference, email, note, budget, status, created_at, updated_at FROM inquiries ORDER BY created_at DESC LIMIT 100')
      send(response, 200, { inquiries })
      return
    }

    const inquiryMatch = pathname.match(/^\/api\/admin\/inquiries\/([^/]+)$/)
    if (inquiryMatch && request.method === 'PATCH') {
      const id = decodeURIComponent(inquiryMatch[1])
      const body = await readJson(request)
      const allowedStatuses = ['new', 'contacted', 'quoted', 'confirmed', 'closed']
      await initializeDatabase()
      if (body.status !== undefined) {
        if (typeof body.status !== 'string' || !allowedStatuses.includes(body.status)) {
          send(response, 400, { error: `Status must be one of: ${allowedStatuses.join(', ')}.` }); return
        }
        const rows = await query(`UPDATE inquiries SET status = ${dialect === 'postgres' ? '$1' : '?'}, updated_at = ${dialect === 'postgres' ? '$2' : '?'} WHERE id = ${dialect === 'postgres' ? '$3' : '?'} RETURNING id`,
          [body.status, new Date().toISOString(), id])
        if (!rows.length) { send(response, 404, { error: 'Enquiry not found.' }); return }
        send(response, 200, { id, status: body.status })
        return
      }
      const text = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : ''
      const eventDate = text(body.event_date, 10)
      const eventType = text(body.event_type, 80)
      const guests = Number(body.guest_count)
      const space = text(body.preferred_space, 80)
      const name = text(body.name, 120)
      const phone = text(body.phone, 40)
      const contactPreference = text(body.contact_preference, 20)
      const email = text(body.email, 254)
      const note = text(body.note, 2000)
      const budget = text(body.budget, 80)
      if (!isValidDate(eventDate) || !eventType || !Number.isInteger(guests) || guests < 1 || guests > 800 || !space || !name || !/^[+\d][\d ()-]{8,}$/.test(phone) || !['whatsapp', 'phone', 'email'].includes(contactPreference) || (contactPreference === 'email' && !email) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        send(response, 400, { error: 'Check the date, celebration, guest count, space, name, contact method, phone, and email details.' }); return
      }
      const fields = [eventDate, eventType, guests, space, name, phone, contactPreference, email || null, note, budget, new Date().toISOString(), id]
      const assignments = ['event_date', 'event_type', 'guest_count', 'preferred_space', 'name', 'phone', 'contact_preference', 'email', 'note', 'budget', 'updated_at'].map((field, index) => `${field} = ${dialect === 'postgres' ? `$${index + 1}` : '?'}`).join(', ')
      const rows = await query(`UPDATE inquiries SET ${assignments} WHERE id = ${dialect === 'postgres' ? '$12' : '?'} RETURNING id`, fields)
      if (!rows.length) { send(response, 404, { error: 'Enquiry not found.' }); return }
      send(response, 200, { id })
      return
    }

    if (inquiryMatch && request.method === 'DELETE') {
      const id = decodeURIComponent(inquiryMatch[1])
      await initializeDatabase()
      const rows = await query(`DELETE FROM inquiries WHERE id = ${dialect === 'postgres' ? '$1' : '?'} RETURNING id`, [id])
      if (!rows.length) { send(response, 404, { error: 'Enquiry not found.' }); return }
      send(response, 200, { id, deleted: true })
      return
    }

    if (pathname === '/api/admin/availability' && request.method === 'GET') {
      await initializeDatabase()
      const availability = await query('SELECT event_date, space, status, updated_at FROM date_availability ORDER BY event_date, space')
      send(response, 200, { availability })
      return
    }

    if (pathname === '/api/admin/availability' && request.method === 'PUT') {
      const body = await readJson(request)
      const date = typeof body.date === 'string' ? body.date : ''
      const space = typeof body.space === 'string' ? body.space.trim().slice(0, 80) : ''
      if (!isValidDate(date) || !space || !['available', 'unavailable'].includes(String(body.status))) {
        send(response, 400, { error: 'Provide a valid date, space, and available or unavailable status.' }); return
      }
      await initializeDatabase()
      await query(`INSERT INTO date_availability (event_date, space, status, updated_at) VALUES (${placeholders(4)}) ON CONFLICT (event_date, space) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
        [date, space, body.status, new Date().toISOString()])
      send(response, 200, { date, space, status: body.status, reservesDate: false })
      return
    }

    send(response, 404, { error: 'Route not found.' })
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500
    if (status === 500) console.error('Backend request failed:', error)
    send(response, status, { error: status === 500 ? 'The backend could not complete this request.' : error.message })
  }
})

await initializeDatabase()
server.listen(port, host, () => {
  console.log(`Suman Vatika API (${dialect}) listening on ${host}:${port}`)
  if (!process.env.ADMIN_PASSWORD || !sessionSecret || sessionSecret.length < 32) {
    console.warn('Admin sign-in is disabled until ADMIN_PASSWORD and a 32+ character ADMIN_SESSION_SECRET are configured.')
  }
})
