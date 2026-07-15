import React from 'react'
import { DashboardLayout } from './dashboard-layout'
import { ProtectedRoute } from './protected-route'

export default function ProtectedDashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
