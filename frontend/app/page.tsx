import { VenueHome } from '@/components/venue-site'

const venueSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'EventVenue'],
  name: 'Suman Vatika',
  description: 'Luxury banquet hall and lawn for weddings, receptions and celebrations in Lucknow.',
  telephone: '+91 98390 74240',
  email: 'sumanvaatika@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '12A, Vijay Nagar Colony, Krishna Nagar, Alambagh',
    addressLocality: 'Lucknow',
    addressRegion: 'Uttar Pradesh',
    postalCode: '226023',
    addressCountry: 'IN',
  },
}

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }} />
      <VenueHome />
    </>
  )
}

export const dynamic = 'force-static'
