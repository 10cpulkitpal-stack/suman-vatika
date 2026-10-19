import AdminDashboard from './admin-dashboard'

export const metadata = {
  title: 'Venue Management | Suman Vatika',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <AdminDashboard />
}

export const dynamic = 'force-dynamic'
