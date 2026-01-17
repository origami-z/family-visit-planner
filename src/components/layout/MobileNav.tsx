import {
  IconCalendar,
  IconHome,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: IconHome, href: '/' },
  { id: 'members', label: 'Members', icon: IconUsers, href: '/members' },
  { id: 'calendar', label: 'Calendar', icon: IconCalendar, href: '/calendar' },
  { id: 'settings', label: 'Settings', icon: IconSettings, href: '/settings' },
]

export function MobileNav() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const navigate = useNavigate()

  if (!isMobile) {
    return null
  }

  const activeSection =
    location.pathname === '/'
      ? 'dashboard'
      : location.pathname.replace(/^\//, '')

  return (
    <nav
      role="navigation"
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-16 items-center justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => navigate({ to: item.href })}
              data-active={isActive}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-sidebar-foreground transition-colors',
                isActive
                  ? 'text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground',
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
