import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ApiStatusBanner } from './components/api-status-banner'

const LandingPage = lazy(() => import('./app/page'))
const LoginPage = lazy(() => import('./app/login/page'))
const SignupPage = lazy(() => import('./app/signup/page'))
const ForgotPasswordPage = lazy(() => import('./app/forgot-password/page'))
const DashboardPage = lazy(() => import('./app/dashboard/page'))
const ProtectedDashboardRoute = lazy(() => import('./components/protected-dashboard-route'))

const lazyDashboardPage = <T extends keyof typeof import('./app/dashboard/subpages')>(exportName: T) =>
  lazy(() =>
    import('./app/dashboard/subpages').then((module) => ({
      default: module[exportName] as React.ComponentType,
    }))
  )

const PDFsPage = lazyDashboardPage('PDFsPage')
const PDFUploadPage = lazyDashboardPage('PDFUploadPage')
const PDFDetailsPage = lazyDashboardPage('PDFDetailsPage')
const QuizzesPage = lazyDashboardPage('QuizzesPage')
const QuizCreatePage = lazyDashboardPage('QuizCreatePage')
const QuizDetailsPage = lazyDashboardPage('QuizDetailsPage')
const QuizStartPage = lazyDashboardPage('QuizStartPage')
const QuizResultPage = lazyDashboardPage('QuizResultPage')
const QuizHistoryPage = lazyDashboardPage('QuizHistoryPage')
const FlashcardsPage = lazyDashboardPage('FlashcardsPage')
const FlashcardsStudyPage = lazyDashboardPage('FlashcardsStudyPage')
const SummariesPage = lazyDashboardPage('SummariesPage')
const SummaryDetailsPage = lazyDashboardPage('SummaryDetailsPage')
const AnalyticsPage = lazyDashboardPage('AnalyticsPage')
const ProfilePage = lazyDashboardPage('ProfilePage')
const SettingsPage = lazyDashboardPage('SettingsPage')
const NotificationsPage = lazyDashboardPage('NotificationsPage')

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center text-zinc-100">
      <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
      <p className="text-xs font-mono text-zinc-400">Loading page...</p>
    </div>
  )
}

function DashboardRoute({ children }: { children: React.ReactNode }) {
  return <ProtectedDashboardRoute>{children}</ProtectedDashboardRoute>
}

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dashboard Guarded Routes */}
          <Route
            path="/dashboard"
            element={
              <DashboardRoute>
                <DashboardPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/pdfs"
            element={
              <DashboardRoute>
                <PDFsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/pdfs/upload"
            element={
              <DashboardRoute>
                <PDFUploadPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/pdfs/:id"
            element={
              <DashboardRoute>
                <PDFDetailsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/quizzes"
            element={
              <DashboardRoute>
                <QuizzesPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/quizzes/create"
            element={
              <DashboardRoute>
                <QuizCreatePage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/quizzes/:id"
            element={
              <DashboardRoute>
                <QuizDetailsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/quizzes/:id/start"
            element={
              <DashboardRoute>
                <QuizStartPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/quizzes/:id/result"
            element={
              <DashboardRoute>
                <QuizResultPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/quizzes/history"
            element={
              <DashboardRoute>
                <QuizHistoryPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/flashcards"
            element={
              <DashboardRoute>
                <FlashcardsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/flashcards/:id"
            element={
              <DashboardRoute>
                <FlashcardsStudyPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/summaries"
            element={
              <DashboardRoute>
                <SummariesPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/summaries/:id"
            element={
              <DashboardRoute>
                <SummaryDetailsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <DashboardRoute>
                <AnalyticsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <DashboardRoute>
                <ProfilePage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <DashboardRoute>
                <SettingsPage />
              </DashboardRoute>
            }
          />
          <Route
            path="/dashboard/notifications"
            element={
              <DashboardRoute>
                <NotificationsPage />
              </DashboardRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
