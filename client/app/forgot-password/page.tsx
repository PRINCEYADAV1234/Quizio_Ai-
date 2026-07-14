import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, ArrowRight, Sparkles } from 'lucide-react'
import { auth, sendPasswordResetEmail } from '@/lib/firebase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to send password reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8f9fa] dark:bg-[#08080a] text-zinc-900 dark:text-zinc-100 p-6 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-zinc-900 dark:bg-amber-500 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-white dark:text-zinc-950" />
          </div>
          <h2 className="text-2xl font-serif font-black tracking-tight">Forgot Password</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold mt-1">
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-550 dark:text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-450">
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleReset}>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-450 transition"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 justify-center font-bold bg-amber-500 text-zinc-950 hover:bg-amber-600 rounded-xl transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Back to{' '}
          <Link to="/login" className="text-amber-600 dark:text-amber-450 hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
