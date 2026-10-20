'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, LoaderCircle, LogOut, Pencil, Save, ShieldCheck, Trash2, X } from 'lucide-react'
import { apiFetch } from '@/lib/api'

type GalleryImage = { id: string; src: string; category: string; label: string; sort_order: number }
const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')
const categories = ['Mandap', 'The lawn', 'The grand hall', 'Celebrations']

export default function GalleryAdmin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [category, setCategory] = useState(categories[0])
  const [label, setLabel] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const response = await apiFetch('/api/admin/gallery', { cache: 'no-store' })
    const result = await response.json() as { images?: GalleryImage[]; error?: string }
    if (!response.ok) throw new Error(result.error || 'Could not load gallery images.')
    setImages((result.images ?? []).map((image) => ({ ...image, src: image.src.startsWith('/media/') ? `${apiOrigin}${image.src}` : image.src })))
  }, [])

  useEffect(() => {
    let active = true
    apiFetch('/api/admin/session', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json() as { authenticated?: boolean }
        if (!active) return
        setAuthenticated(Boolean(result.authenticated))
        if (result.authenticated) await load()
      })
      .catch(() => { if (active) { setAuthenticated(false); setError('Could not connect to the admin service.') } })
    return () => { active = false }
  }, [load])

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    if (!file) { setError('Choose a photo to upload.'); return }
    setBusy(true); setError(''); setMessage('')
    const form = new FormData()
    form.set('image', file)
    form.set('category', category)
    form.set('label', label)
    try {
      const response = await apiFetch('/api/admin/gallery', { method: 'POST', body: form })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not upload the image.')
      await load(); setFile(null); setLabel(''); formElement.reset(); setMessage('Image added to the gallery.')
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the image.') }
    finally { setBusy(false) }
  }

  async function saveDetails(event: React.FormEvent<HTMLFormElement>, image: GalleryImage) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const updates = { category: String(form.get('category') ?? ''), label: String(form.get('label') ?? '') }
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await apiFetch(`/api/admin/gallery/${encodeURIComponent(image.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not save image details.')
      setImages((current) => current.map((item) => item.id === image.id ? { ...item, ...updates } : item)); setEditing(null); setMessage('Image details saved.')
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Could not save image details.') }
    finally { setBusy(false) }
  }

  async function move(image: GalleryImage, direction: number) {
    const index = images.findIndex((item) => item.id === image.id)
    const target = index + direction
    if (target < 0 || target >= images.length) return
    const other = images[target]
    setBusy(true); setError(''); setMessage('')
    try {
      const [first, second] = await Promise.all([
        apiFetch(`/api/admin/gallery/${encodeURIComponent(image.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: other.sort_order }) }),
        apiFetch(`/api/admin/gallery/${encodeURIComponent(other.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sort_order: image.sort_order }) }),
      ])
      if (!first.ok || !second.ok) throw new Error('Could not reorder gallery images.')
      await load(); setMessage('Gallery order updated.')
    } catch (moveError) { setError(moveError instanceof Error ? moveError.message : 'Could not reorder gallery images.') }
    finally { setBusy(false) }
  }

  async function remove(image: GalleryImage) {
    if (!window.confirm(`Remove “${image.label}” from the public gallery?`)) return
    setBusy(true); setError(''); setMessage('')
    try {
      const response = await apiFetch(`/api/admin/gallery/${encodeURIComponent(image.id)}`, { method: 'DELETE' })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Could not remove the image.')
      setImages((current) => current.filter((item) => item.id !== image.id)); setMessage('Image removed from the gallery.')
    } catch (removeError) { setError(removeError instanceof Error ? removeError.message : 'Could not remove the image.') }
    finally { setBusy(false) }
  }

  async function signOut() { await apiFetch('/api/admin/session', { method: 'DELETE' }); window.location.href = '/admin' }

  if (authenticated === null) return <main className="admin-loading"><LoaderCircle className="admin-spinner" size={26} /><span>Opening private venue desk…</span></main>
  if (!authenticated) return <main className="admin-login-page"><section className="admin-login-card"><div className="admin-lock-icon"><ShieldCheck size={24} /></div><span className="eyebrow"><i /> PRIVATE VENUE MANAGEMENT</span><h1>Sign in to <em>continue.</em></h1><p>Open the venue desk first, then choose Manage gallery.</p><Link className="button button-maroon button-wide" href="/admin">Go to admin sign in</Link></section></main>

  return <main className="admin-page"><header className="admin-header"><Link className="brand-mark" href="/"><span className="brand-symbol">S<span>V</span></span><span className="brand-wordmark"><strong>Suman Vatika</strong><small>PRIVATE VENUE DESK</small></span></Link><div className="admin-header-actions"><span className="admin-secure-label"><ShieldCheck size={15} /> Private</span><button className="admin-quiet-button" type="button" onClick={signOut}><LogOut size={15} /> Sign out</button></div></header><section className="admin-content gallery-admin-content"><Link className="gallery-admin-back" href="/admin"><ArrowLeft size={15} /> Back to enquiries</Link><div className="admin-heading"><div><span className="eyebrow"><i /> WEBSITE CONTENT</span><h1>Gallery <em>images.</em></h1><p>Add and arrange the photos visitors see on the website.</p></div><span className="gallery-admin-count">{images.length} photos</span></div>{error && <p className="form-error admin-error" role="alert">{error}</p>}{message && <p className="gallery-admin-message" role="status">{message}</p>}
    <form className="gallery-upload-panel" onSubmit={upload}><div><span className="eyebrow"><i /> ADD A PHOTO</span><h2>Make room for another <em>moment.</em></h2><p>JPG, PNG, WebP, or AVIF · up to 8 MB each.</p></div><label>Choose photo<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required /></label><div className="gallery-upload-fields"><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Caption<input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={120} placeholder="A short description" required /></label><button className="button button-maroon" type="submit" disabled={busy}><ImagePlus size={16} /> {busy ? 'Saving…' : 'Add to gallery'}</button></div></form>
    <div className="gallery-admin-list-heading"><div><h2>Current photos</h2><span>Changes appear on the website gallery.</span></div></div>{images.length ? <div className="gallery-admin-grid">{images.map((image, index) => <article className="gallery-admin-card" key={image.id}><div className="gallery-admin-preview"><img src={image.src} alt={image.label} /><span>{image.category}</span><div className="gallery-order-controls"><button type="button" aria-label="Move image up" disabled={busy || index === 0} onClick={() => move(image, -1)}><ArrowUp size={15} /></button><button type="button" aria-label="Move image down" disabled={busy || index === images.length - 1} onClick={() => move(image, 1)}><ArrowDown size={15} /></button></div></div>{editing === image.id ? <form className="gallery-edit-form" onSubmit={(event) => saveDetails(event, image)}><label>Category<select name="category" defaultValue={image.category}>{categories.map((item) => <option key={item}>{item}</option>)}{!categories.includes(image.category) && <option>{image.category}</option>}</select></label><label>Caption<input name="label" defaultValue={image.label} maxLength={120} required /></label><div><button type="submit" disabled={busy}><Save size={14} /> Save</button><button type="button" onClick={() => setEditing(null)}><X size={14} /> Cancel</button></div></form> : <div className="gallery-admin-card-caption"><div><strong>{image.label}</strong><span>{image.category}</span></div><div className="gallery-admin-card-actions"><button type="button" disabled={busy} onClick={() => setEditing(image.id)} aria-label={`Edit ${image.label}`}><Pencil size={15} /></button><button type="button" disabled={busy} onClick={() => remove(image)} aria-label={`Remove ${image.label}`}><Trash2 size={15} /></button></div></div>}</article>)}</div> : <div className="admin-empty"><div><ImagePlus size={23} /></div><h3>No gallery photos yet.</h3><p>Upload a photo above and it will appear on the website.</p></div>}
  </section></main>
}
