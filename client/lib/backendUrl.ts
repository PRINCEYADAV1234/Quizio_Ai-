const DEFAULT_BACKEND_URL = 'http://localhost:5000'

export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('VITE_BACKEND_URL')
    if (override) return override.replace(/\/+$/, '')
  }
  const rawUrl = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL
  return rawUrl.replace(/\/+$/, '')
}
