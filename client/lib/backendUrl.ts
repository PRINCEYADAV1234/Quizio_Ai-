const DEFAULT_BACKEND_URL = 'http://localhost:5000'

export function getBackendUrl() {
  const rawUrl = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL
  return rawUrl.replace(/\/+$/, '')
}
