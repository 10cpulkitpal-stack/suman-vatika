const apiOrigin = process.env.NODE_ENV === 'production' ? '' : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/+$/, '')

export function apiFetch(path: string, init: RequestInit = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return fetch(`${apiOrigin}${normalizedPath}`, { ...init, credentials: 'include' })
}
