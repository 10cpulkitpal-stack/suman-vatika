'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Menu,
  Phone,
  Sparkles,
  X,
} from 'lucide-react'

const phoneHref = 'tel:+919839074240'
const whatsappHref = 'https://wa.me/919839074240'
const address = '12A, Vijay Nagar Colony, Krishna Nagar, Alambagh, Lucknow, Uttar Pradesh 226023'
const venueImages = [
  { src: '/suman-vatika-mandap.png', category: 'Mandap', label: 'A setting made for the moment' },
  { src: '/suman-vatika-lawn.png', category: 'The lawn', label: 'An evening under the stars' },
  { src: '/suman-vatika-hall.png', category: 'The grand hall', label: 'A room for the whole family' },
  { src: '/suman-vatika-celebration.png', category: 'Celebrations', label: 'Every detail, thoughtfully prepared' },
]
const packages = [
  { name: 'Silver Utsav', capacity: 'Up to 250 guests', price: '₹1,50,000', tone: 'light', features: ['Grand hall', 'Basic decor', 'Standard menu', 'Parking & security', '4-hour celebration'] },
  { name: 'Gold Utsav', capacity: 'Up to 500 guests', price: '₹3,25,000', tone: 'featured', features: ['Hall + lawn', 'Premium mandap decor', 'Multi-cuisine catering', 'DJ & professional sound', 'Full-day access'] },
  { name: 'Royal Suman', capacity: 'Up to 800 guests', price: '₹5,50,000', tone: 'dark', features: ['Exclusive hall + lawn', 'Designer floral mandap', 'Live counters', 'Dedicated event manager', 'Two-day access'] },
]
const amenityItems = [
  ['01', 'Full power backup', 'Dual 125 kVA silent DG sets for uninterrupted celebrations.'],
  ['02', 'LED walls & sound', 'Professional LED walls and line-array audio for every occasion.'],
  ['03', 'Valet parking', 'Convenient parking capacity for 150+ vehicles.'],
  ['04', 'Bridal suite', 'A private preparation and vanity space for the wedding party.'],
  ['05', 'Gourmet catering', 'Pure vegetarian, multi-cuisine menus with live counters.'],
  ['06', 'Thoughtful access', 'Wheelchair-friendly ramps and senior-friendly facilities.'],
  ['07', 'Wi-Fi & live stream', 'High-speed connectivity for guests near and far.'],
  ['08', 'Guest security', 'CCTV coverage and trained security staff on site.'],
]

type InquiryValues = { date: string; event: string; guests: string; space: string; name: string; phone: string; email: string; note: string; budget: string }
const initialInquiry: InquiryValues = { date: '', event: '', guests: '250', space: '', name: '', phone: '', email: '', note: '', budget: '' }

function SectionIntro({ eyebrow, title, copy, light = false }: { eyebrow: string; title: string; copy?: string; light?: boolean }) {
  return <div className={`section-intro${light ? ' section-intro-light' : ''}`}><span className="eyebrow"><i />{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>
}

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand-mark${inverse ? ' brand-mark-inverse' : ''}`} aria-label="Suman Vatika home"><span className="brand-symbol">S<span>V</span></span><span className="brand-wordmark"><strong>Suman Vatika</strong><small>WEDDINGS & CELEBRATIONS</small></span></Link>
}

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const links = [['About', '#about'], ['Spaces', '/spaces'], ['Gallery', '/gallery'], ['Packages', '/packages'], ['Experiences', '#experiences'], ['Contact', '/contact']]
  return <header className="site-header"><div className="header-inner"><BrandMark /><nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="Main navigation">{links.map(([label, href]) => <Link key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav><div className="header-actions"><a className="header-call" href={phoneHref}><Phone size={14} /> <span>+91 98390 74240</span></a><a className="button button-maroon button-small" href="/#inquiry">Check date <ArrowUpRight size={14} /></a></div><button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div></header>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><BrandMark inverse /><p>Made for the moments that become family stories. A place for Lucknow to gather, celebrate and begin again.</p><span className="social-note">Social channels coming soon</span></div><div className="footer-column"><span>Explore</span><Link href="/#about">Our story</Link><Link href="/spaces">Spaces</Link><Link href="/gallery">Gallery</Link><Link href="/packages">Celebration packages</Link></div><div className="footer-column"><span>Reach us</span><a href={phoneHref}>+91 98390 74240</a><a href="mailto:sumanvaatika@gmail.com">sumanvaatika@gmail.com</a><a href="https://maps.google.com/?q=12A+Vijay+Nagar+Colony+Alambagh+Lucknow" target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={13} /></a></div><div className="footer-address"><span>Find us in Lucknow</span><p>{address}</p><Link href="/contact">Plan a visit <ArrowUpRight size={14} /></Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Suman Vatika. All rights reserved.</span><span>Thoughtfully hosted in Lucknow, India</span><Link href="/admin">Admin</Link></div></footer>
}

function MobileActionBar() {
  return <nav className="mobile-action-bar" aria-label="Quick contact"><a href={phoneHref}><Phone size={16} /><span>Call</span></a><a href={`${whatsappHref}?text=${encodeURIComponent('Hello Suman Vatika, I would like to plan a celebration.')}`} target="_blank" rel="noreferrer"><span className="wa-mark">W</span><span>WhatsApp</span></a><a className="mobile-book" href="/#inquiry"><Sparkles size={15} /><span>Plan a visit</span></a></nav>
}

function AvailabilityStrip({ onOpen }: { onOpen: (date: string, event: string) => void }) {
  const [date, setDate] = useState('')
  const [event, setEvent] = useState('')
  return <div className="availability-strip"><div className="availability-label"><span className="availability-dot" /><span>YOUR DAY, YOUR WAY</span><strong>Let's find your date.</strong></div><div className="availability-field"><label htmlFor="hero-date">Event date</label><input id="hero-date" type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} /></div><div className="availability-field"><label htmlFor="hero-event">Celebration</label><select id="hero-event" value={event} onChange={(event) => setEvent(event.target.value)}><option value="" disabled>Choose an occasion</option><option>Wedding</option><option>Reception</option><option>Engagement</option><option>Mehendi / Sangeet</option><option>Birthday</option><option>Corporate event</option></select></div><button className="button button-gold" type="button" onClick={() => onOpen(date, event)}>Enquire for your date <ArrowRight size={16} /></button></div>
}

function InquiryModal({ open, onClose, prefill = { date: '', event: '' } }: { open: boolean; onClose: () => void; prefill?: Pick<InquiryValues, 'date' | 'event'> }) {
  const [step, setStep] = useState(1)
  const [values, setValues] = useState(initialInquiry)
  const [error, setError] = useState('')
  const update = (key: keyof InquiryValues, value: string) => setValues((current) => ({ ...current, [key]: value }))
  useEffect(() => {
    setValues((current) => ({ ...current, date: prefill.date, event: prefill.event }))
  }, [prefill.date, prefill.event])
  if (!open) return null
  const goToDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.date || !values.event || !values.space) { setError('Please add your event date, celebration type and preferred space.'); return }
    setError('')
    setStep(2)
  }
  const sendInquiry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.name.trim() || !/^[+\d][\d ()-]{8,}$/.test(values.phone)) { setError('Please enter your name and a valid WhatsApp number.'); return }
    const message = `Hello Suman Vatika, I would like to enquire about my celebration.\nName: ${values.name}\nWhatsApp: ${values.phone}\nEmail: ${values.email || 'Not provided'}\nDate: ${values.date}\nEvent: ${values.event}\nGuests: ${values.guests}\nPreferred space: ${values.space}\nBudget: ${values.budget || 'To be discussed'}\nNotes: ${values.note || 'None'}`
    window.open(`${whatsappHref}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setError('')
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title"><button type="button" className="modal-close" aria-label="Close enquiry form" onClick={onClose}><X /></button><span className="eyebrow"><i />A NOTE TO OUR TEAM</span><h2 id="inquiry-title">Let's make it <em>meaningful.</em></h2><div className="step-indicator"><span className={step === 1 ? 'step-current' : 'step-done'}>{step > 1 ? <Check size={13} /> : '01'} Event details</span><i /><span className={step === 2 ? 'step-current' : ''}>02 Your details</span></div>{step === 1 ? <form onSubmit={goToDetails} className="inquiry-form"><label>Event date<input type="date" min={new Date().toISOString().slice(0, 10)} value={values.date} onChange={(event) => update('date', event.target.value)} required /></label><label>Celebration<select value={values.event} onChange={(event) => update('event', event.target.value)} required><option value="" disabled>Select event type</option>{['Wedding', 'Reception', 'Engagement', 'Mehendi / Sangeet', 'Haldi', 'Birthday', 'Corporate event', 'Other celebration'].map((item) => <option key={item}>{item}</option>)}</select></label><div className="form-row"><label>Approx. guests<input type="number" min="1" max="800" value={values.guests} onChange={(event) => update('guests', event.target.value)} required /></label><label>Preferred space<select value={values.space} onChange={(event) => update('space', event.target.value)} required><option value="" disabled>Select a space</option><option>Grand AC Hall</option><option>Royal Open Lawn</option><option>Hall + Lawn</option></select></label></div><p className="form-note">Live availability and online lead storage are not connected. Your details will be added to a WhatsApp message; send it there to contact the venue. This does not reserve a date.</p>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-maroon button-wide" type="submit">Continue <ArrowRight size={16} /></button></form> : <form onSubmit={sendInquiry} className="inquiry-form"><button className="form-back" type="button" onClick={() => { setStep(1); setError('') }}><ArrowLeft size={14} /> Back to event details</button><label>Your name<input autoComplete="name" value={values.name} onChange={(event) => update('name', event.target.value)} required placeholder="Full name" /></label><div className="form-row"><label>WhatsApp number<input autoComplete="tel" type="tel" value={values.phone} onChange={(event) => update('phone', event.target.value)} required placeholder="+91" /></label><label>Email <small>optional</small><input autoComplete="email" type="email" value={values.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" /></label></div><label>Budget range<select value={values.budget} onChange={(event) => update('budget', event.target.value)}><option value="">Let's discuss</option><option>Under ₹2 lakh</option><option>₹2–4 lakh</option><option>₹4–6 lakh</option><option>₹6 lakh+</option></select></label><label>Anything you'd like us to know?<textarea rows={3} value={values.note} onChange={(event) => update('note', event.target.value)} placeholder="Your ideas, requests, or questions" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-maroon button-wide" type="submit">Continue on WhatsApp <ArrowUpRight size={16} /></button><p className="form-note">Your details will be placed in a WhatsApp message. They are not stored on this website.</p></form>}</section></div>
}

function Hero({ onOpen }: { onOpen: (date: string, event: string) => void }) {
  return <section className="hero" aria-labelledby="hero-heading"><Image src="/suman-vatika-hero.png" alt="An illuminated mandap set for an evening celebration at Suman Vatika" fill priority sizes="100vw" className="hero-image" /><div className="hero-shade" /><div className="hero-content"><span className="hero-kicker"><i /> A LUCKNOW CELEBRATION HOUSE <i /></span><h1 id="hero-heading">Where dreams<br />begin <em>together.</em></h1><p className="hero-subtitle">Lucknow's premier luxury banquet & lawn</p><p className="hero-description">An elegant setting for weddings, reunions and all the moments that bring your people closer.</p><div className="hero-buttons"><button className="button button-gold" onClick={() => onOpen('', '')}>Check your date <ArrowUpRight size={16} /></button><a className="hero-link" href="#spaces">Explore the venue <ArrowDownRight size={16} /></a></div></div><div className="hero-caption"><span>01 / 04</span><i /><span>ALAMBAGH · LUCKNOW</span></div><div className="hero-side-note">A PLACE TO GATHER · A DAY TO REMEMBER</div><div className="hero-scroll"><ArrowDown size={14} /><span>SCROLL TO DISCOVER</span></div><AvailabilityStrip onOpen={onOpen} /></section>
}

function AboutSection() {
  const occasions = ['Mehendi', 'Haldi', 'Sangeet', 'Baraat', 'Mandap', 'Wedding', 'Reception', 'Milestones']
  return <section id="about" className="about-section section-pad"><div className="about-copy"><span className="eyebrow"><i /> OUR STORY · 15+ YEARS</span><h2>A venue built for<br /><em>every celebration.</em></h2><p className="about-lead">Some days deserve more than a room. They deserve a place where the welcome feels warm, the details feel considered and every generation finds its place.</p><p>From intimate ceremonies to a joyful gathering of hundreds, our indoor hall and open lawn come together to make your celebration feel entirely your own.</p><a className="text-link" href="#spaces">Discover our spaces <ArrowRight size={15} /></a><div className="occasion-list" aria-label="Celebration types">{occasions.map((item) => <span key={item}>{item}</span>)}</div></div><div className="about-visual"><div className="about-photo-frame"><Image src="/suman-vatika-mandap.png" alt="Floral mandap with warm brass lighting" fill sizes="(max-width: 720px) 90vw, 42vw" /></div><div className="about-inset"><Image src="/suman-vatika-hall.png" alt="The grand air-conditioned banquet hall" fill sizes="220px" /></div><div className="about-seal"><span>LUCKNOW</span><strong>15<small>+</small></strong><span>YEARS OF<br />CELEBRATIONS</span></div><span className="photo-caption">CELEBRATIONS, MADE PERSONAL</span></div><div className="stats-row"><div><strong>800<span>+</span></strong><span>Guests, together</span></div><div><strong>500<span>+</span></strong><span>Events celebrated</span></div><div><strong>15<span>+</span></strong><span>Years of hospitality</span></div><div className="stats-aside">Many stories.<br /><em>One special place.</em></div></div></section>
}

function SpacesSection() {
  const [space, setSpace] = useState<'hall' | 'lawn'>('hall')
  const [arrangement, setArrangement] = useState<'Theatre' | 'Banquet' | 'Cocktail'>('Banquet')
  const capacity = space === 'hall' ? { Theatre: 500, Banquet: 500, Cocktail: 500 } : { Theatre: 800, Banquet: 800, Cocktail: 800 }
  const title = space === 'hall' ? 'The Grand\nAir-Conditioned Hall' : 'The Royal\nOpen Lawn'
  const points = space === 'hall' ? ['Centralized air conditioning', 'Wedding stage & mandap setup', 'Acoustic-ready for sangeet', 'Comfort for 500+ guests'] : ['Open-air celebrations for up to 800', 'Baraat & arrival staging', 'Outdoor dining and marquee options', 'A garden atmosphere after dark']
  return <section id="spaces" className="spaces-section section-pad"><div className="spaces-heading"><SectionIntro eyebrow="ROOM TO CELEBRATE" title="Two distinct spaces.\nEndless possibilities." copy="Choose the atmosphere that feels like you. Bring both together when the guest list calls for it." /><div className="space-tabs" role="tablist" aria-label="Venue space"><button role="tab" aria-selected={space === 'hall'} className={space === 'hall' ? 'active' : ''} onClick={() => setSpace('hall')}>The Grand Hall <span>01</span></button><button role="tab" aria-selected={space === 'lawn'} className={space === 'lawn' ? 'active' : ''} onClick={() => setSpace('lawn')}>The Royal Lawn <span>02</span></button></div></div><div className="space-feature"><div className="space-image"><Image key={space} src={space === 'hall' ? '/suman-vatika-hall.png' : '/suman-vatika-lawn.png'} alt={space === 'hall' ? 'Interior of the Grand air-conditioned hall' : 'Open garden lawn prepared for an evening wedding'} fill sizes="(max-width: 760px) 100vw, 58vw" /><span className="image-index">0{space === 'hall' ? 1 : 2} / SPACES</span><span className="image-frame-corner" /></div><div className="space-details"><span className="eyebrow"><i /> SPACE 0{space === 'hall' ? 1 : 2}</span><h3>{title.split('\n').map((line) => <span key={line}>{line}<br /></span>)}</h3><p>{space === 'hall' ? 'A gracious indoor setting where thoughtful light, comfortable surroundings and the right acoustics let the celebration take centre stage.' : 'A green, open-air setting for warm evenings, grand arrivals and the freedom to celebrate under the Lucknow sky.'}</p><ul>{points.map((point) => <li key={point}><Check size={14} />{point}</li>)}</ul><div className="capacity-tool"><label htmlFor="layout-choice">CAPACITY BY SETUP</label><select id="layout-choice" value={arrangement} onChange={(event) => setArrangement(event.target.value as typeof arrangement)}><option>Theatre</option><option>Banquet</option><option>Cocktail</option></select><div className="capacity-meter"><span style={{ width: `${Math.min(100, capacity[arrangement] / 8)}%` }} /><i /></div><div className="capacity-numbers"><strong>~{capacity[arrangement]}</strong><span>guests · indicative</span></div></div><a className="text-link" href="#inquiry">Plan this space <ArrowRight size={15} /></a></div></div></section>
}

function GallerySection({ standalone = false }: { standalone?: boolean }) {
  const [filter, setFilter] = useState('All moments')
  const [selected, setSelected] = useState<number | null>(null)
  const filters = ['All moments', 'Mandap', 'The lawn', 'The grand hall', 'Celebrations']
  const filtered = filter === 'All moments' ? venueImages : venueImages.filter((item) => item.category === filter)
  const imageIndex = selected === null ? -1 : venueImages.findIndex((image) => image.src === filtered[selected]?.src)
  const selectedImage = imageIndex >= 0 ? venueImages[imageIndex] : null
  const moveImage = (direction: number) => { if (imageIndex < 0) return; const next = (imageIndex + direction + venueImages.length) % venueImages.length; const nextCategoryIndex = filtered.findIndex((image) => image.src === venueImages[next].src); setSelected(nextCategoryIndex < 0 ? 0 : nextCategoryIndex); if (nextCategoryIndex < 0) setFilter('All moments') }
  return <section id="gallery" className={`gallery-section section-pad${standalone ? ' gallery-standalone' : ''}`}><div className="gallery-heading"><SectionIntro eyebrow="A GLIMPSE OF THE DAY" title={standalone ? 'A little of the magic.' : 'The feeling stays with you.'} copy="A few details from a place made for the moments you will talk about for years." /><Link href="/gallery" className="text-link gallery-all-link">View the gallery <ArrowUpRight size={15} /></Link></div><div className="gallery-filters" role="tablist" aria-label="Gallery categories">{filters.map((item) => <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? 'active' : ''} onClick={() => { setFilter(item); setSelected(null) }}>{item}</button>)}</div><div className="gallery-grid">{filtered.map((item, index) => <button className={`gallery-tile gallery-tile-${index + 1}`} type="button" key={item.src} onClick={() => setSelected(index)} aria-label={`Open image: ${item.label}`}><Image src={item.src} alt={item.label} fill sizes="(max-width: 700px) 90vw, 40vw" /><span className="gallery-tile-overlay"><span>{item.category}</span><strong>{item.label}</strong><ArrowUpRight size={19} /></span></button>)}</div><div className="gallery-note"><span>IMAGES FROM OUR CELEBRATION COLLECTION</span><i /><span>01 — 04</span></div>{selectedImage && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null) }} onKeyDown={(event) => { if (event.key === 'Escape') setSelected(null); if (event.key === 'ArrowRight') moveImage(1); if (event.key === 'ArrowLeft') moveImage(-1) }} tabIndex={-1}><button className="lightbox-close" aria-label="Close image" onClick={() => setSelected(null)}><X /></button><button className="lightbox-prev" aria-label="Previous image" onClick={() => moveImage(-1)}><ChevronLeft /></button><div className="lightbox-image"><Image src={selectedImage.src} alt={selectedImage.label} fill sizes="90vw" /></div><button className="lightbox-next" aria-label="Next image" onClick={() => moveImage(1)}><ChevronRight /></button><p>{selectedImage.label} <span>· {selectedImage.category}</span></p></div>}</section>
}

function PackagesSection({ standalone = false, onEnquire }: { standalone?: boolean; onEnquire: () => void }) {
  return <section id="packages" className={`packages-section section-pad${standalone ? ' packages-standalone' : ''}`}><div className="packages-heading"><SectionIntro eyebrow="A STARTING POINT, NOT A LIMIT" title={standalone ? 'Find your kind of celebration.' : 'A thoughtful beginning.'} copy="Each celebration is different. These starting points help us understand what matters to you." /><span className="package-currency-note">INVESTMENT FROM<br /><b>₹ INR</b></span></div><div className="package-grid">{packages.map((item, index) => <article key={item.name} className={`package-card package-${item.tone}`}><div className="package-top"><span>0{index + 1} / CELEBRATION</span>{item.tone === 'featured' && <span className="package-badge">MOST BOOKED</span>}</div><div className="package-title"><h3>{item.name}</h3><span>{item.capacity}</span></div><div className="package-price"><strong>{item.price}</strong><span>onwards</span></div><div className="package-rule" /><p className="package-includes">A considered foundation for the day you have in mind.</p><ul>{item.features.map((feature) => <li key={feature}><Check size={14} />{feature}</li>)}</ul><button type="button" onClick={onEnquire} className="package-cta">Enquire about this <ArrowUpRight size={15} /></button></article>)}</div><p className="package-disclaimer">Indicative starting prices. Final pricing depends on date, guest count and event requirements; our team will prepare a tailored quotation.</p></section>
}

function CalculatorSection({ onEnquire }: { onEnquire: () => void }) {
  const [guests, setGuests] = useState(300)
  const [space, setSpace] = useState('Hall + Lawn')
  const [decor, setDecor] = useState('Premium')
  const [catering, setCatering] = useState('Premium Multi-Cuisine')
  const [entertainment, setEntertainment] = useState('DJ')
  const [extras, setExtras] = useState<string[]>([])
  const baseEstimate = guests <= 250 ? 150000 : guests <= 500 ? 325000 : 550000
  const estimate = baseEstimate + (space === 'Lawn Only' ? 20000 : 0) + (decor === 'Premium' ? 25000 : decor === 'Royal Floral' ? 65000 : 0) + (catering === 'Premium Multi-Cuisine' ? 30000 : catering === 'Live Counters' ? 60000 : 0) + (entertainment === 'DJ' ? 25000 : entertainment === 'DJ + Premium Sound' ? 50000 : 0) + extras.reduce((total, extra) => total + (extra === 'Bridal Suite' ? 12000 : extra === 'LED Wall' ? 18000 : 30000), 0)
  const toggleExtra = (value: string) => setExtras((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  return <section id="calculator" className="calculator-section section-pad"><div className="calculator-copy"><span className="eyebrow eyebrow-light"><i /> A FIRST LOOK AT THE NUMBERS</span><h2>Plan your<br /><em>celebration.</em></h2><p>Bring your ideas together and explore an indicative investment. We'll shape the details around what matters to you.</p><div className="calculator-assurance"><Sparkles size={16} /><span>A thoughtful estimate, never a final quote.</span></div></div><div className="calculator-panel"><div className="calculator-panel-head"><span>YOUR CELEBRATION, YOUR WAY</span><span>01 — 05</span></div><div className="calc-guest-row"><label htmlFor="guest-slider">Guest count</label><output htmlFor="guest-slider">{guests}<small> guests</small></output></div><input id="guest-slider" className="guest-slider" type="range" min="150" max="800" step="25" value={guests} onChange={(event) => setGuests(Number(event.target.value))} /><div className="slider-labels"><span>150 guests</span><span>800 guests</span></div><div className="calc-options"><label>Space<select value={space} onChange={(event) => setSpace(event.target.value)}><option>Hall Only</option><option>Lawn Only</option><option>Hall + Lawn</option></select></label><label>Decor<select value={decor} onChange={(event) => setDecor(event.target.value)}><option>Basic</option><option>Premium</option><option>Royal Floral</option></select></label><label>Catering<select value={catering} onChange={(event) => setCatering(event.target.value)}><option>Standard</option><option>Premium Multi-Cuisine</option><option>Live Counters</option></select></label><label>Entertainment<select value={entertainment} onChange={(event) => setEntertainment(event.target.value)}><option>No DJ</option><option>DJ</option><option>DJ + Premium Sound</option></select></label></div><fieldset className="calc-extras"><legend>Consider adding</legend>{['Bridal Suite', 'LED Wall', 'Additional Decor'].map((extra) => <label key={extra}><input type="checkbox" checked={extras.includes(extra)} onChange={() => toggleExtra(extra)} /><span><Check size={12} /></span>{extra}</label>)}</fieldset><div className="estimate-row"><div><span>ESTIMATED INVESTMENT</span><small>Indicative range · actual quote may vary</small></div><strong>₹{(estimate / 100000).toFixed(2)}L <span>onwards</span></strong></div><button className="button button-gold button-wide" onClick={onEnquire}>Get a detailed quotation <ArrowRight size={15} /></button></div></section>
}

function AmenitiesSection() {
  return <section id="experiences" className="amenities-section section-pad"><div className="amenities-heading"><SectionIntro eyebrow="THE DETAILS, TAKEN CARE OF" title="More than a beautiful setting." copy="The thoughtful details behind the scenes let you be present for the moments that matter." /><a href="#inquiry" className="text-link">Ask about our facilities <ArrowRight size={15} /></a></div><div className="amenities-grid">{amenityItems.map(([number, title, copy]) => <article className="amenity-item" key={number}><span className="amenity-number">{number}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight className="amenity-arrow" size={17} /></article>)}</div></section>
}

function TourSection() {
  return <section className="tour-section"><Image src="/suman-vatika-lawn.png" alt="Open lawn with a wedding celebration setting" fill sizes="100vw" /><div className="tour-overlay" /><div className="tour-content"><span className="eyebrow eyebrow-light"><i /> TAKE A CLOSER LOOK</span><h2>Explore Suman Vatika<br /><em>in every detail.</em></h2><p>A 360° venue tour is being prepared. Until then, we would love to show you around in person.</p><a href="#inquiry" className="button button-outline-light">Arrange a visit <ArrowUpRight size={16} /></a></div><span className="tour-mark">SV / LKO</span></section>
}

function StoriesSection() {
  return <section className="stories-section section-pad"><div className="stories-heading"><SectionIntro eyebrow="CELEBRATIONS, IN THEIR OWN WORDS" title="Real celebrations.\nReal memories." copy="Every event leaves a little of its story with us. Yours could be next." /><span className="stories-flourish">"</span></div><div className="story-placeholder"><div className="story-photo"><Image src="/suman-vatika-celebration.png" alt="A warmly lit celebration table set for guests" fill sizes="(max-width: 700px) 90vw, 45vw" /><span>YOUR STORY COULD BE HERE</span></div><div className="story-copy"><span className="eyebrow"><i /> A NOTE FROM THE VENUE</span><h3>Some moments are<br /><em>better shared.</em></h3><p>We are gathering stories and approved photographs from the families who have celebrated here. Until then, imagine your own names in the frame.</p><a href="#inquiry" className="text-link">Begin your story <ArrowRight size={15} /></a><div className="story-footnote">REAL WEDDINGS & GUEST REVIEWS<br />SHARED WITH PERMISSION</div></div></div><div className="review-honesty"><span className="review-stars">★★★★★</span><div><strong>Guest reviews</strong><p>Verified Google review data will appear here when connected. We don't publish unverified ratings.</p></div><span className="review-source">GOOGLE REVIEWS<br /><small>INTEGRATION PENDING</small></span></div></section>
}

function LocationSection() {
  return <section id="location" className="location-section section-pad"><div className="location-copy"><SectionIntro eyebrow="A WARM WELCOME IN LUCKNOW" title="Find your way to\nSuman Vatika." copy="Easy to find in Alambagh, close to the neighbourhoods and routes that bring Lucknow together." /><div className="address-line"><MapPin size={18} /><p>{address}</p></div><div className="location-actions"><a className="button button-maroon" href="https://maps.google.com/?q=12A+Vijay+Nagar+Colony+Alambagh+Lucknow" target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={15} /></a><a href={phoneHref} className="button button-outline">Call the venue <Phone size={15} /></a></div><div className="nearby-list"><span>NEARBY LANDMARKS</span><p><i /> Charbagh Railway Station</p><p><i /> Lucknow Airport</p><p><i /> Alambagh Bus Stand</p></div></div><a className="map-art" href="https://maps.google.com/?q=12A+Vijay+Nagar+Colony+Alambagh+Lucknow" target="_blank" rel="noreferrer" aria-label="Open Suman Vatika in Google Maps"><div className="map-grid" /><div className="map-road map-road-one" /><div className="map-road map-road-two" /><div className="map-road map-road-three" /><span className="map-area map-area-one">ALAMBAGH</span><span className="map-area map-area-two">KRISHNA NAGAR</span><span className="map-water" /><span className="map-pin"><MapPin size={19} /><b>SUMAN VATIKA</b></span><span className="map-open">OPEN IN MAPS <ArrowUpRight size={14} /></span></a></section>
}

function InquirySection({ onOpen }: { onOpen: () => void }) {
  return <section id="inquiry" className="inquiry-section"><div className="inquiry-section-text"><span className="eyebrow eyebrow-light"><i /> YOUR CELEBRATION STARTS HERE</span><h2>Let's make room<br />for <em>your people.</em></h2><p>Tell us what you are dreaming up. Our team will help you take the next step.</p><button className="button button-gold" onClick={onOpen}>Start an enquiry <ArrowRight size={16} /></button></div><div className="inquiry-side"><span className="inquiry-big-number">15<span>+</span></span><p>years of making<br />room for joy.</p><span className="inquiry-side-rule" /><a href={phoneHref}><Phone size={15} /> +91 98390 74240</a><a href="mailto:sumanvaatika@gmail.com">sumanvaatika@gmail.com</a></div></section>
}

export function VenueHome() {
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [inquiryPrefill, setInquiryPrefill] = useState<Pick<InquiryValues, 'date' | 'event'>>({ date: '', event: '' })
  const openInquiry = (date = '', event = '') => {
    setInquiryPrefill({ date, event })
    setInquiryOpen(true)
  }
  return <><SiteHeader /><main><Hero onOpen={openInquiry} /><AboutSection /><SpacesSection /><GallerySection /><TourSection /><PackagesSection onEnquire={() => openInquiry()} /><CalculatorSection onEnquire={() => openInquiry()} /><AmenitiesSection /><StoriesSection /><LocationSection /><InquirySection onOpen={() => openInquiry()} /></main><SiteFooter /><MobileActionBar /><InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} prefill={inquiryPrefill} /></>
}

function InnerPageHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="inner-hero"><div className="inner-hero-image"><Image src="/suman-vatika-hero.png" alt="Wedding mandap at Suman Vatika" fill sizes="100vw" /></div><div className="inner-hero-shade" /><div className="inner-hero-copy"><span className="eyebrow eyebrow-light"><i />{eyebrow}</span><h1>{title}</h1><p>{copy}</p><div className="breadcrumbs"><Link href="/">Home</Link><ChevronRight size={13} /><span>{eyebrow}</span></div></div></section>
}

export function GalleryPage() {
  return <><SiteHeader /><main><InnerPageHero eyebrow="THE GALLERY" title="A little of the magic." copy="Spaces, details and celebrations from a venue built for the moments that matter." /><GallerySection standalone /><section className="page-cta"><span>HAVE A DAY IN MIND?</span><h2>Let's imagine it here.</h2><Link href="/#inquiry" className="button button-gold">Plan a celebration <ArrowUpRight size={15} /></Link></section></main><SiteFooter /><MobileActionBar /></>
}

export function SpacesPage() {
  const [open, setOpen] = useState(false)
  return <><SiteHeader /><main><InnerPageHero eyebrow="OUR SPACES" title="Room for every kind of together." copy="Two distinct settings, and the flexibility to bring your celebration to life your way." /><SpacesSection /><section className="page-cta"><span>LET'S FIND THE RIGHT SETTING</span><h2>Your people belong here.</h2><Link href="/#inquiry" className="button button-gold">Enquire about a date <ArrowUpRight size={15} /></Link></section></main><SiteFooter /><MobileActionBar /><InquiryModal open={open} onClose={() => setOpen(false)} /></>
}

export function PackagesPage() {
  const [open, setOpen] = useState(false)
  return <><SiteHeader /><main><InnerPageHero eyebrow="CELEBRATION PACKAGES" title="A thoughtful beginning." copy="A few ways to start planning. Each celebration is tailored to your date, people and priorities." /><PackagesSection standalone onEnquire={() => setOpen(true)} /><CalculatorSection onEnquire={() => setOpen(true)} /><section className="page-cta"><span>EVERY DETAIL IS PERSONAL</span><h2>Let's shape yours together.</h2><button className="button button-gold" onClick={() => setOpen(true)}>Get a detailed quote <ArrowUpRight size={15} /></button></section></main><SiteFooter /><MobileActionBar /><InquiryModal open={open} onClose={() => setOpen(false)} /></>
}

export function ContactPage() {
  const [open, setOpen] = useState(false)
  return <><SiteHeader /><main><InnerPageHero eyebrow="CONTACT & VISITS" title="We would love to meet." copy="Come see the spaces, share what you are planning and let us help you think through the details." /><LocationSection /><InquirySection onOpen={() => setOpen(true)} /></main><SiteFooter /><MobileActionBar /><InquiryModal open={open} onClose={() => setOpen(false)} /></>
}

export function AdminUnavailablePage() {
  return <main className="admin-unavailable"><BrandMark /><span className="eyebrow"><i /> PRIVATE VENUE MANAGEMENT</span><h1>Admin access is<br /><em>not configured.</em></h1><p>A secure admin area needs a database and authentication provider. No demo login or client-side gate is provided, so this route is intentionally unavailable until those services are connected.</p><Link href="/" className="button button-maroon">Return to the website <ArrowLeft size={15} /></Link></main>
}

export { SiteHeader, SiteFooter, MobileActionBar }
