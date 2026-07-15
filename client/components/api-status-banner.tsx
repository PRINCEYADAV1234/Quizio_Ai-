import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { onApiAvailable, onApiUnavailable } from '@/lib/apiStatus'

export function ApiStatusBanner() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const stopUnavailable = onApiUnavailable((detail) => {
      setMessage(detail.message || 'API NOT WORKING. Backend server is not responding.')
    })
    const stopAvailable = onApiAvailable(() => setMessage(''))

    return () => {
      stopUnavailable()
      stopAvailable()
    }
  }, [])

  if (!message) return null

  return (
    <div className="fixed left-1/2 top-3 z-[100] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-lg border border-red-500/30 bg-red-950 text-red-50 shadow-xl">
      <div className="flex items-start gap-3 px-4 py-3">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-300" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wider">API NOT WORKING</p>
          <p className="mt-0.5 text-xs font-semibold text-red-100">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => setMessage('')}
          className="rounded p-1 text-red-100 hover:bg-red-900"
          aria-label="Dismiss API warning"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
