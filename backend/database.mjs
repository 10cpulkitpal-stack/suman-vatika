import { mkdirSync } from 'node:fs'
import { dirname, isAbsolute, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import postgres from 'postgres'

const configuredUrl = process.env.DATABASE_URL ?? 'file:./data/suman-vatika.db'
let dialect
let query

if (configuredUrl.startsWith('postgres://') || configuredUrl.startsWith('postgresql://')) {
  dialect = 'postgres'
  const client = postgres(configuredUrl, { max: 5, idle_timeout: 20, connect_timeout: 10 })
  query = (statement, params = []) => client.unsafe(statement, params)
} else {
  dialect = 'sqlite'
  const filePath = configuredUrl.startsWith('file:') ? configuredUrl.slice('file:'.length) : configuredUrl
  const absolutePath = isAbsolute(filePath) ? filePath : resolve(process.cwd(), filePath)
  mkdirSync(dirname(absolutePath), { recursive: true })
  const client = new DatabaseSync(absolutePath)
  client.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
  query = (statement, params = []) => client.prepare(statement.replace(/\$(\d+)/g, '?')).all(...params)
}

export { dialect, query }

export async function initializeDatabase() {
  await query(`CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    event_date TEXT NOT NULL,
    event_type TEXT NOT NULL,
    guest_count INTEGER NOT NULL,
    preferred_space TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    contact_preference TEXT NOT NULL DEFAULT 'whatsapp',
    email TEXT,
    note TEXT NOT NULL DEFAULT '',
    budget TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`)
  if (dialect === 'postgres') {
    await query("ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS contact_preference TEXT NOT NULL DEFAULT 'whatsapp'")
  } else {
    const columns = await query('PRAGMA table_info(inquiries)')
    if (!columns.some((column) => column.name === 'contact_preference')) {
      await query("ALTER TABLE inquiries ADD COLUMN contact_preference TEXT NOT NULL DEFAULT 'whatsapp'")
    }
  }
  await query('CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries (created_at)')
  await query('CREATE INDEX IF NOT EXISTS inquiries_event_date_idx ON inquiries (event_date)')
  await query(`CREATE TABLE IF NOT EXISTS date_availability (
    event_date TEXT NOT NULL,
    space TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'unavailable')),
    updated_at TEXT NOT NULL,
    PRIMARY KEY (event_date, space)
  )`)
  await query(`CREATE TABLE IF NOT EXISTS gallery_images (
    id TEXT PRIMARY KEY,
    src TEXT NOT NULL,
    category TEXT NOT NULL,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`)
  await query('CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  const gallerySeed = await query(`SELECT value FROM app_settings WHERE key = ${dialect === 'postgres' ? '$1' : '?'}`, ['gallery_seeded'])
  if (!gallerySeed.length) {
    const images = [
      ['/suman-vatika-mandap.png', 'Mandap', 'A setting made for the moment'],
      ['/suman-vatika-lawn.png', 'The lawn', 'An evening under the stars'],
      ['/suman-vatika-hall.png', 'The grand hall', 'A room for the whole family'],
      ['/suman-vatika-celebration.png', 'Celebrations', 'Every detail, thoughtfully prepared'],
    ]
    for (const [index, [src, category, label]] of images.entries()) {
      await query(`INSERT INTO gallery_images (id, src, category, label, sort_order, created_at) VALUES (${placeholders(6)})`, [`seed-${index + 1}`, src, category, label, index, new Date().toISOString()])
    }
    await query(`INSERT INTO app_settings (key, value) VALUES (${placeholders(2)})`, ['gallery_seeded', 'true'])
  }
}

export function placeholders(count) {
  return Array.from({ length: count }, (_, index) => dialect === 'postgres' ? `$${index + 1}` : '?').join(', ')
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}
