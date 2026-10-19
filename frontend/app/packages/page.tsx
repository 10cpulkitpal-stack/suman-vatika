import { PackagesPage } from '@/components/venue-site'

export const metadata = {
  title: 'Celebration Packages | Suman Vatika Lucknow',
  description: 'See indicative event package starting points at Suman Vatika. Pricing is tailored to your date and celebration.',
}

export default function Page() {
  return <PackagesPage />
}

export const dynamic = 'force-static'
