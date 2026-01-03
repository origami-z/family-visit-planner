import React from 'react'
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { MembersView } from '@/components/members/MembersView'
import { CalendarView } from '@/components/calendar/CalendarView'
import { SettingsView } from '@/components/settings/SettingsView'

// Root layout route
const rootRoute = createRootRoute({
  component: () => (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ),
})

// Dashboard route (index)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardView,
})

// Members route
const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: MembersView,
})

// Calendar route
const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: CalendarView,
})

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsView,
})

// Build route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  membersRoute,
  calendarRoute,
  settingsRoute,
])

// Create router with hash history
const router = createRouter({
  routeTree,
  history: createHashHistory(),
})

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />
}
