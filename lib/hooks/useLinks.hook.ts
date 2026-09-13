'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'

export function useLinks() {
  const locale = useLocale()
  const t = useTranslations('global.routes')

  const items = useMemo(() => {
    const mainItems = [
      { name: t('courses'), path: '/' },
      { name: t('setup'), path: '/setup' },
      { name: t('progress'), path: '/progress' },
    ] as const

    const socialItems = [
      { name: 'Mail', icon: 'ph:envelope-simple', url: 'mailto:sinakheiri.dev@gmail.com' },
      {
        name: 'Linkedin',
        icon: 'ph:linkedin-logo',
        url: 'https://www.linkedin.com/in/sinakheiri-dev',
      },
      { name: 'Github', icon: 'proicons:github', url: 'https://github.com/lWarwolfl' },
    ] as const

    return { mainItems, socialItems }
  }, [locale, t])

  return items
}

export type TMainLinkItem = ReturnType<typeof useLinks>['mainItems'][number]
