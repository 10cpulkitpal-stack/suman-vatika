import GalleryAdmin from './gallery-admin'

export const metadata = {
  title: 'Manage Gallery | Suman Vatika',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return <GalleryAdmin />
}
