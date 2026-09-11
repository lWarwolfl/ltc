'use client'

import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { useLinks } from '@/lib/hooks/useLinks.hook'
import { usePathHelper } from '@/lib/hooks/usePathHelper.hook'
import { cn } from '@/lib/utils'
import { GraduationCap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function Header() {
  const { mainItems } = useLinks()
  const { isCurrentPath } = usePathHelper()
  const t = useTranslations('global.app')

  return (
    <header className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="text-foreground flex items-center gap-2">
        <GraduationCap className="text-primary size-6" />
        <span className="text-lg font-semibold">{t('name')}</span>
      </Link>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <nav className="flex items-center gap-1">
          {mainItems.map((item) => (
            <Button
              key={item.path}
              variant={isCurrentPath(item.path) ? 'secondary' : 'ghost'}
              size="sm"
              asChild
            >
              <Link href={item.path} className={cn(isCurrentPath(item.path) && 'font-medium')}>
                {item.name}
              </Link>
            </Button>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
