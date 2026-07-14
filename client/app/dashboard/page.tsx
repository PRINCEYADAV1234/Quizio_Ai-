import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Upload, Flame, TrendingUp, Clock, FileText, Zap,
  CheckCircle, Activity, Award, Brain, ArrowRight
} from 'lucide-react'
import { useAuthStore } from '@/lib/authStore'
import api from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { profile, analytics } = useAuthStore()
  const [recentPdfs, setRecentPdfs] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/pdfs'),
      api.get('/api/attempts/history')
    ])
      .then(([pdfsRes, attemptsRes]) => {
        setRecentPdfs(pdfsRes.data.slice(0, 3))
        setAttempts(attemptsRes.data.slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const graphData = attempts.map((a, i) => ({
    name: `Q${i + 1}`,
    score: a.score,
  })).reverse()

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/25 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[10px] font-bold text-amber-500 tracking-widest uppercase">System Operational</span>
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight mt-1">
            Good to see you, {profile?.name || 'Scholar'} 👋
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-lg leading-relaxed font-semibold">
            Upload notes, textbooks or slides to instantly generate customizable quizzes, summaries and interactive flashcards.
          </p>
        </div>
        <Link to="/dashboard/pdfs/upload">
          <Button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl flex items-center gap-2 px-5 py-5.5">
            <Upload className="w-4 h-4" /> Upload Document
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Quizzes</span>
            <CheckCircle className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{analytics?.totalQuizzes || 0}</p>
        </div>

        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Average Score</span>
            <Award className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-emerald-500">{analytics?.averageScore || 0}%</p>
        </div>

        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Streak</span>
            <Flame className="w-4.5 h-4.5 text-orange-550" />
          </div>
          <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{analytics?.streak || 0} days</p>
        </div>

        <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-2">
          <div className="flex justify-between items-center text-zinc-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Study Time</span>
            <Clock className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{analytics?.studyTime || 0}m</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent PDFs & History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <h3 className="font-serif font-black text-lg">Recent Documents</h3>
              <Link to="/dashboard/pdfs" className="text-xs font-bold text-amber-500 hover:underline">View All</Link>
            </div>

            {loading ? (
              <div className="text-center py-6 text-zinc-450 font-mono">Loading data...</div>
            ) : recentPdfs.length === 0 ? (
              <p className="text-xs text-zinc-450 text-center py-6">No PDF documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentPdfs.map(pdf => (
                  <div key={pdf._id} className="flex justify-between items-center p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-amber-500/30 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-bold truncate text-zinc-800 dark:text-zinc-200">{pdf.title}</span>
                    </div>
                    <Link to={`/dashboard/pdfs/${pdf._id}`}>
                      <Button variant="ghost" size="sm" className="text-xs font-bold text-amber-500 hover:text-amber-600">
                        Study Portal
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Curves */}
          <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
            <h3 className="font-serif font-black text-lg mb-4">Recall Trend Curve</h3>
            <div className="h-60">
              {graphData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <XAxis dataKey="name" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-zinc-400">Complete quizzes to plot your trend curve.</div>
              )}
            </div>
          </div>
        </div>

        {/* Weak Topics & AI Recommendations */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-serif font-black text-lg">Continue Learning</h3>
            <div className="space-y-3">
              <Link to="/dashboard/quizzes/create" className="block p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-amber-500/50 transition">
                <div className="flex items-center gap-3">
                  <Brain className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold">Generate Quiz</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">MCQs, True/False, blanks</p>
                  </div>
                </div>
              </Link>
              <Link to="/dashboard/flashcards" className="block p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 hover:border-amber-500/50 transition">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold">Interactive Flashcards</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Spaced recall decks</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-serif font-black text-lg">AI recommendations</h3>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold leading-relaxed text-amber-700 dark:text-amber-400 space-y-2">
              <Activity className="w-5 h-5 mb-1 text-amber-500" />
              <p>Your recall rate is stabilizing at {analytics?.averageScore || 0}%.</p>
              <p>We recommend creating a new medium difficulty MCQ quiz from your recent documents to solidify memory links.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
