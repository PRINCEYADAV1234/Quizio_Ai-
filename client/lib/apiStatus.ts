export type ApiStatusDetail = {
  message: string
}

const API_UNAVAILABLE_EVENT = 'quizio:api-unavailable'
const API_AVAILABLE_EVENT = 'quizio:api-available'

export function reportApiUnavailable(message = 'API NOT WORKING. Backend server is not responding.') {
  window.dispatchEvent(new CustomEvent<ApiStatusDetail>(API_UNAVAILABLE_EVENT, {
    detail: { message },
  }))
}

export function reportApiAvailable() {
  window.dispatchEvent(new Event(API_AVAILABLE_EVENT))
}

export function onApiUnavailable(callback: (detail: ApiStatusDetail) => void) {
  const handler = (event: Event) => {
    callback((event as CustomEvent<ApiStatusDetail>).detail)
  }

  window.addEventListener(API_UNAVAILABLE_EVENT, handler)
  return () => window.removeEventListener(API_UNAVAILABLE_EVENT, handler)
}

export function onApiAvailable(callback: () => void) {
  window.addEventListener(API_AVAILABLE_EVENT, callback)
  return () => window.removeEventListener(API_AVAILABLE_EVENT, callback)
}
