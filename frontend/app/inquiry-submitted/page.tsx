import Link from 'next/link'
import { Check } from 'lucide-react'

export default function InquirySubmittedPage() {
  return <main className="submission-page">
    <Link className="submission-brand" href="/" aria-label="Return to Suman Vatika home">
      <span className="brand-symbol">S<span>V</span></span>
      <span className="brand-wordmark"><strong>Suman Vatika</strong><small>WEDDINGS & CELEBRATIONS</small></span>
    </Link>
    <section className="submission-card" aria-labelledby="submission-heading">
      <div className="submission-check"><Check size={27} strokeWidth={1.5} /></div>
      <span className="eyebrow"><i /> ENQUIRY RECEIVED</span>
      <h1 id="submission-heading">Your request has been <em>submitted.</em></h1>
      <p>Thank you for getting in touch with Suman Vatika. Our team will contact you soon to discuss your celebration.</p>
      <Link className="button button-maroon" href="/">Return to the website <span aria-hidden="true">→</span></Link>
    </section>
    <p className="submission-footnote">Your enquiry does not reserve an event date.</p>
  </main>
}
