'use client'

import LanguageSelector from '@/components/common/language-selector'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useLinks } from '@/lib/hooks/useLinks.hook'
import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function Footer() {
  const { socialItems } = useLinks()
  const t = useTranslations('global.app')
  const tf = useTranslations('footer')

  return (
    <footer className="flex w-full flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
      <div className="text-muted-foreground flex flex-col gap-1 text-center text-sm sm:text-start">
        <span>
          {t('name')} © {new Date().getFullYear()}
        </span>
        <span>{tf('rights')}</span>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSelector />

        <TooltipProvider>
          {socialItems.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" asChild>
                  <Link href={item.url} target="_blank" rel="noreferrer">
                    <Icon className="size-4.5 shrink-0" icon={item.icon} />
                  </Link>
                </Button>
              </TooltipTrigger>

              <TooltipContent>{item.name}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </footer>
  )
}
