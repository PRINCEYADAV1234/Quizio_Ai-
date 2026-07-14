import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './app/page'
import LoginPage from './app/login/page'
import SignupPage from './app/signup/page'
import ForgotPasswordPage from './app/forgot-password/page'
import DashboardPage from './app/dashboard/page'
import { ProtectedRoute } from './components/protected-route'
import { DashboardLayout } from './components/dashboard-layout'
import {
  PDFsPage,
  PDFUploadPage,
  PDFDetailsPage,
  QuizzesPage,
  QuizCreatePage,
  QuizDetailsPage,
  QuizStartPage,
  QuizResultPage,
  QuizHistoryPage,
  FlashcardsPage,
  FlashcardsStudyPage,
  SummariesPage,
  SummaryDetailsPage,
  AnalyticsPage,
  ProfilePage,
  SettingsPage,
  NotificationsPage,
} from './app/dashboard/subpages'

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
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/pdfs"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PDFsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/pdfs/upload"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PDFUploadPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/pdfs/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PDFDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quizzes"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizzesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quizzes/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizCreatePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quizzes/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quizzes/:id/start"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizStartPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quizzes/:id/result"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizResultPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/quizzes/history"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QuizHistoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/flashcards"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FlashcardsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/flashcards/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FlashcardsStudyPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/summaries"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SummariesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/summaries/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SummaryDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
