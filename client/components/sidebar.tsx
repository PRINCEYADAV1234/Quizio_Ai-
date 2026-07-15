import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  BookOpen,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/authStore'
import { getUserDisplayName, getUserInitial } from '@/lib/userDisplay'

interface SidebarProps {
  userInitial?: string
  userName?: string
}

export function Sidebar({ userInitial: propInitial, userName: propName }: SidebarProps = {}) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { profile, user, logout } = useAuthStore()
  
  const userName = propName || getUserDisplayName(profile, user)
  const userInitial = propInitial || getUserInitial(userName)
  const avatar = profile?.avatar

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    }
    return 'dark'
  })

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'PDF Library', href: '/dashboard/pdfs' },
    { icon: HelpCircle, label: 'Quizzes', href: '/dashboard/quizzes' },
    { icon: BookOpen, label: 'Flashcards', href: '/dashboard/flashcards' },
    { icon: FileText, label: 'Summaries', href: '/dashboard/summaries' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#0c0c0e]/95 border-r border-zinc-200/80 dark:border-zinc-800/60 overflow-y-auto flex flex-col pt-6 transition-all duration-300 z-35">
      {/* Brand Header */}
      <div className="px-6 mb-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-lg text-zinc-950 font-serif">
            Q
          </div>
          <span className="text-xl font-serif font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Quizio
          </span>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && isActive(item.href))
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 font-semibold text-xs tracking-tight ${
                active
                  ? 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-950 dark:text-amber-400'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 stroke-[1.5]" />
                <span>{item.label}</span>
              </div>
              
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-amber-500 shadow-sm" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Theme */}
      <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800/50 space-y-3">
        <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200/40 dark:border-zinc-800/20">
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-1">Theme</span>
          <Button size="icon-xs" variant="ghost" onClick={toggleTheme} className="text-zinc-500 dark:text-zinc-400">
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 stroke-[1.5]" /> : <Moon className="w-3.5 h-3.5 stroke-[1.5]" />}
          </Button>
        </div>

        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {avatar ? (
              <img src={avatar} alt={userName} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-amber-500 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs">
                {userInitial.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-250 truncate tracking-tight">
                {userName}
              </p>
            </div>
          </div>
          <Button size="icon-xs" variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400">
            <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
