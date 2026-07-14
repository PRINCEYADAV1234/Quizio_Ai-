import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Lock, Sparkles, ArrowRight, Layers } from 'lucide-react'
import { auth, googleProvider, signInWithEmailAndPassword, signInWithPopup } from '@/lib/firebase'
import { useAuthStore } from '@/lib/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
        setError('Invalid email or password.')
      } else {
        setError(err.message || 'Failed to log in. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Google Sign-In failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#f8f9fa] dark:bg-[#08080a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* Left Branding Canvas: 50/50 Division */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-white dark:bg-[#0c0c0e] border-r border-zinc-200/80 dark:border-zinc-800/60">
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-5">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Brand header */}
        <div className="relative z-10">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-amber-500 rounded-lg flex items-center justify-center mb-6 shadow-md">
            <Sparkles className="w-5 h-5 text-white dark:text-zinc-950" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Quizio</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider mt-1.5">AI Active Recall Engine</p>
        </div>

        {/* Spaced Repetition Card Stack */}
        <div className="relative z-10 w-full max-w-xs mx-auto my-auto space-y-4">
          <div className="relative">
            <div className="absolute inset-x-4 top-4 h-full bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 translate-y-4 scale-[0.92] -z-10 shadow-sm" />
            <div className="absolute inset-x-2 top-2 h-full bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-850 translate-y-2 scale-[0.96] -z-5 shadow-sm" />
            
            <div className="relative rounded-2xl border border-zinc-200/85 dark:border-t-zinc-800/80 dark:border-x-zinc-900 dark:border-b-zinc-900 bg-white dark:bg-[#121215] p-6 shadow-md space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                <span>Core Biology</span>
                <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Spaced Recall</span>
              </div>
              <p className="font-extrabold text-zinc-800 dark:text-zinc-150 text-base tracking-tight leading-snug">
                &quot;What is the primary function of mitochondria?&quot;
              </p>
              <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-1/3" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Interval: 4 days</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider">Mastered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/10">
          <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 leading-relaxed">
            &quot;Converting raw syllabus outlines to structured active recalls saves study time immediately. The AI card extraction handles the cognitive load.&quot;
          </p>
        </div>
      </div>

      {/* Right Panel: Form Panel */}
      <div className="flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="max-w-sm mx-auto w-full space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome back</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Access your Quizio learning space</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-550 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
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

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-amber-600 dark:text-amber-450 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-amber-500 dark:focus:border-amber-450 transition"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 justify-center font-bold bg-amber-500 text-zinc-950 hover:bg-amber-600 rounded-xl transition mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Social login */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#f8f9fa] dark:bg-[#08080a] px-2 text-zinc-450 dark:text-zinc-500 font-bold">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full h-11 justify-center font-bold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl"
          >
            Google Sign In
          </Button>

          {/* Switch screens */}
          <p className="text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-amber-600 dark:text-amber-450 hover:underline font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
