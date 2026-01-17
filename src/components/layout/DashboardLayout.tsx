import {
  IconCalendar,
  IconHome,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { MobileNav } from './MobileNav'
import type { ReactNode } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  // Derive active section from pathname
  const activeSection =
    pathname === '/' ? 'dashboard' : pathname.replace(/^\//, '')

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: IconHome, href: '/' },
    { id: 'members', label: 'Members', icon: IconUsers, href: '/members' },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: IconCalendar,
      href: '/calendar',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: IconSettings,
      href: '/settings',
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-border px-6 py-4">
            <h1 className="text-xl font-bold text-foreground">
              Family Visit Planner
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={activeSection === item.id}
                      onClick={() => navigate({ to: item.href })}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 overflow-auto bg-background pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </SidebarProvider>
  )
}
