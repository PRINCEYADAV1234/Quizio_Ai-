import React, { useState } from 'react'
import { Sidebar } from './sidebar'
import { useAuthStore } from '@/lib/authStore'
import { Bell, Search, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Determine greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="min-h-screen bg-[#f4f5f6] dark:bg-[#050507] text-zinc-900 dark:text-zinc-100 flex transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-zinc-950/60 backdrop-blur-sm">
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0c0c0e] shadow-xl p-4">
            <div className="flex justify-between items-center mb-6">
              <span className="font-serif font-black text-lg tracking-tight text-amber-500">Quizio</span>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-zinc-200/80 dark:border-zinc-800/60 bg-white/70 dark:bg-[#050507]/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-serif font-bold text-zinc-800 dark:text-zinc-200 text-base">
                {getGreeting()}, {profile?.name || 'Scholar'} 👋
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden sm:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search resources, quizzes..."
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Notification Bell */}
            <Link to="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-450">
              <Bell className="w-4.5 h-4.5" />
            </Link>

            {/* Profile Avatar */}
            <Link to="/dashboard/settings" className="flex items-center gap-2">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-xs text-zinc-950 font-mono">
                  {profile?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
