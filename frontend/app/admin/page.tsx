import { AdminUnavailablePage } from '@/components/venue-site'

export const metadata = {
  title: 'Venue Management | Suman Vatika',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminUnavailablePage />
}

export const dynamic = 'force-static'
