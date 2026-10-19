'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, Check, CheckCircle2, Clock3, LoaderCircle, LogOut, Mail, Pencil, Phone, RefreshCw, Search, ShieldCheck, Trash2, Users, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'confirmed' | 'closed'
type Inquiry = {
  id: string
  event_date: string
  event_type: string
  guest_count: number
  preferred_space: string
  name: string
  phone: string
  contact_preference: 'whatsapp' | 'phone' | 'email'
  email: string | null
  note: string
  budget: string
  status: InquiryStatus
  created_at: string
}

const statuses: InquiryStatus[] = ['new', 'contacted', 'quoted', 'confirmed', 'closed']
const eventDate = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
const receivedDate = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadInquiries = useCallback(async () => {
    const response = await apiFetch('/api/admin/inquiries', { cache: 'no-store' })
    const result = await response.json() as { inquiries?: Inquiry[]; error?: string }
    if (!response.ok) throw new Error(result.error || 'Could not load enquiries.')
    setInquiries(result.inquiries ?? [])
    setAuthenticated(true)
  }, [])

  useEffect(() => {
    let active = true
    apiFetch('/api/admin/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then(async (result: { authenticated: boolean }) => {
        if (!active) return
        if (!result.authenticated) { setAuthenticated(false); return }
        try { await loadInquiries() } catch (loadError) {
          if (active) { setAuthenticated(true); setError(loadError instanceof Error ? loadError.message : 'Could not load enquiries.') }
        }
      })
      .catch(() => { if (active) { setAuthenticated(false); setError('Could not connect to the admin service.') } })
    return () => { active = false }
  }, [loadInquiries])

  const visibleInquiries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return inquiries.filter((inquiry) => {
      const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
      const matchesSearch = !query || [inquiry.name, inquiry.phone, inquiry.email, inquiry.event_type, inquiry.preferred_space, inquiry.event_date].some((value) => value?.toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
  }, [inquiries, search, statusFilter])

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await apiFetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not sign in.')
      setPassword('')
      await loadInquiries()
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  async function updateStatus(inquiry: Inquiry, status: InquiryStatus) {
    setError('')
    try {
      const response = await apiFetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not update enquiry.')
      setInquiries((current) => current.map((item) => item.id === inquiry.id ? { ...item, status } : item))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update enquiry.')
    }
  }

  async function saveInquiry(event: React.FormEvent<HTMLFormElement>, inquiry: Inquiry) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const updates = Object.fromEntries(form.entries())
    updates.guest_count = Number(updates.guest_count) as unknown as FormDataEntryValue
    try {
      const response = await apiFetch(`/api/admin/inquiries/${inquiry.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not save enquiry.')
      setInquiries((current) => current.map((item) => item.id === inquiry.id ? { ...item, ...updates, guest_count: Number(updates.guest_count), email: String(updates.email || '') || null } as Inquiry : item))
      setEditingId(null)
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not save enquiry.') }
    finally { setSaving(false) }
  }

  async function deleteInquiry(inquiry: Inquiry) {
    if (!window.confirm(`Permanently delete the complete request from ${inquiry.name}? This cannot be undone.`)) return
    setError('')
    try {
      const response = await apiFetch(`/api/admin/inquiries/${inquiry.id}`, { method: 'DELETE' })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not delete enquiry.')
      setInquiries((current) => current.filter((item) => item.id !== inquiry.id))
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Could not delete enquiry.') }
  }

  async function signOut() {
    await apiFetch('/api/admin/session', { method: 'DELETE' })
    setAuthenticated(false)
    setInquiries([])
  }

  if (authenticated === null) {
    return <main className="admin-loading"><LoaderCircle className="admin-spinner" size={26} /><span>Opening private venue desk…</span></main>
  }

  if (!authenticated) {
    return <main className="admin-login-page"><Link className="admin-back-link" href="/">← Back to Suman Vatika</Link><section className="admin-login-card"><div className="admin-lock-icon"><ShieldCheck size={24} /></div><span className="eyebrow"><i /> PRIVATE VENUE MANAGEMENT</span><h1>Welcome <em>back.</em></h1><p>Sign in to review celebration enquiries and follow up with guests.</p><form onSubmit={signIn} className="admin-login-form"><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus /><button className="button button-maroon button-wide" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Open the venue desk'}</button>{error && <p className="form-error" role="alert">{error}</p>}</form><small className="admin-login-footnote">Private access for the Suman Vatika team.</small></section></main>
  }

  return <main className="admin-page"><header className="admin-header"><Link className="brand-mark" href="/"><span className="brand-symbol">S<span>V</span></span><span className="brand-wordmark"><strong>Suman Vatika</strong><small>PRIVATE VENUE DESK</small></span></Link><div className="admin-header-actions"><span className="admin-secure-label"><ShieldCheck size={15} /> Private</span><button className="admin-quiet-button" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></div></header><section className="admin-content"><div className="admin-heading"><div><span className="eyebrow"><i /> VENUE MANAGEMENT</span><h1>Enquiries <em>& follow-ups.</em></h1><p>Review requests from guests and keep their next step up to date.</p></div><button className="button button-outline" type="button" onClick={() => { setError(''); setBusy(true); loadInquiries().catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not refresh.')).finally(() => setBusy(false)) }} disabled={busy}><RefreshCw size={15} className={busy ? 'admin-spinner' : ''} /> Refresh</button></div><div className="admin-summary"><div><span>INBOX</span><strong>{inquiries.length}</strong><small>Total enquiries saved</small></div><div><span>NEEDS FOLLOW-UP</span><strong>{inquiries.filter((item) => item.status === 'new').length}</strong><small>New requests</small></div><div><span>UPCOMING DATES</span><strong>{inquiries.filter((item) => item.event_date >= new Date().toISOString().slice(0, 10) && item.status !== 'closed').length}</strong><small>Open enquiries</small></div></div><div className="admin-list-heading"><div><h2>Guest requests</h2><span>{visibleInquiries.length} shown</span></div><div className="admin-filters"><label className="admin-search"><Search size={15} /><input aria-label="Search enquiries" placeholder="Search name, event, phone…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></div></div>{error && <p className="form-error admin-error" role="alert">{error}</p>}{visibleInquiries.length ? <div className="admin-inquiry-list">{visibleInquiries.map((inquiry) => <article className="admin-inquiry-card" key={inquiry.id}><div className="admin-inquiry-main">{editingId === inquiry.id ? <form className="admin-edit-form" onSubmit={(event) => saveInquiry(event, inquiry)}><label>Client name<input name="name" required maxLength={120} defaultValue={inquiry.name} /></label><label>Celebration<input name="event_type" required maxLength={80} defaultValue={inquiry.event_type} /></label><label>Event date<input name="event_date" type="date" required defaultValue={inquiry.event_date} /></label><label>Guests<input name="guest_count" type="number" min="1" max="800" required defaultValue={inquiry.guest_count} /></label><label>Preferred space<input name="preferred_space" required maxLength={80} defaultValue={inquiry.preferred_space} /></label><label>Phone<input name="phone" required maxLength={40} defaultValue={inquiry.phone} /></label><label>Email<input name="email" type="email" maxLength={254} defaultValue={inquiry.email ?? ''} /></label><label>Preferred contact<select name="contact_preference" defaultValue={inquiry.contact_preference}><option value="whatsapp">WhatsApp</option><option value="phone">Phone call</option><option value="email">Email</option></select></label><label>Budget<input name="budget" maxLength={80} defaultValue={inquiry.budget} /></label><label className="admin-edit-wide">Client note<textarea name="note" maxLength={2000} defaultValue={inquiry.note} /></label><div className="admin-edit-actions"><button className="admin-edit-button" type="submit" disabled={saving}><Check size={14} /> {saving ? 'Saving…' : 'Save changes'}</button><button className="admin-edit-button" type="button" onClick={() => setEditingId(null)}><X size={14} /> Cancel</button></div></form> : <><div className="admin-inquiry-title"><div><span className="admin-event-label">{inquiry.event_type}</span><h3>{inquiry.name}</h3></div><label className={`admin-status status-${inquiry.status}`}><span /> <select aria-label={`Status for ${inquiry.name}`} value={inquiry.status} onChange={(event) => updateStatus(inquiry, event.target.value as InquiryStatus)}>{statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label></div><div className="admin-inquiry-meta"><span><CalendarDays size={15} /> {eventDate(inquiry.event_date)}</span><span><Users size={15} /> {inquiry.guest_count} guests</span><span>{inquiry.preferred_space}</span><span>Prefers {inquiry.contact_preference === 'phone' ? 'phone call' : inquiry.contact_preference === 'email' ? 'email' : 'WhatsApp'}</span>{inquiry.budget && <span>{inquiry.budget}</span>}</div><div className="admin-contact-links"><a href={`tel:${inquiry.phone}`}><Phone size={14} /> {inquiry.phone}</a>{inquiry.email && <a href={`mailto:${inquiry.email}`}><Mail size={14} /> {inquiry.email}</a>}</div>{inquiry.note && <p className="admin-guest-note">“{inquiry.note}”</p>}<footer><span><Clock3 size={13} /> Received {receivedDate(inquiry.created_at)}</span><div className="admin-card-actions"><button type="button" onClick={() => setEditingId(inquiry.id)}><Pencil size={14} /> Edit details</button><button type="button" className="admin-delete-button" onClick={() => deleteInquiry(inquiry)}><Trash2 size={14} /> Delete request</button><a href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><CheckCircle2 size={14} /> Contact on WhatsApp</a></div></footer></>}</div></article>)}</div> : <div className="admin-empty"><div><CalendarDays size={23} /></div><h3>{search || statusFilter !== 'all' ? 'No matching enquiries.' : 'Your inbox is clear.'}</h3><p>{search || statusFilter !== 'all' ? 'Try adjusting your search or status filter.' : 'New requests submitted through the website will appear here.'}</p></div>}<p className="admin-data-note">Enquiries are requests for information. They do not reserve an event date.</p></section></main>
}
