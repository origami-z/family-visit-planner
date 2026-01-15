import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react'
import type { Theme } from '@/types/theme'
import { useTheme } from '@/context/ThemeContext'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const themeOptions: Array<{
  value: Theme
  label: string
  icon: typeof IconSun
}> = [
  { value: 'light', label: 'Light', icon: IconSun },
  { value: 'dark', label: 'Dark', icon: IconMoon },
  { value: 'system', label: 'System', icon: IconDeviceDesktop },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-2">
      <Label>Theme</Label>
      <div className="flex gap-2">
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value
          return (
            <Button
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex items-center gap-2',
                isActive && 'pointer-events-none',
              )}
              aria-pressed={isActive}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </Button>
          )
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Choose your preferred appearance. System follows your device settings.
      </p>
    </div>
  )
}
