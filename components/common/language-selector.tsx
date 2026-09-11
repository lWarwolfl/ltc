'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { locales, useLocaleWithProps } from '@/i18n/i18n-configs'
import { cn } from '@/lib/utils'
import { setUserLocale } from '@/server/locale'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export type LanguageSelectorProps = React.ComponentProps<typeof SelectTrigger>

export default function LanguageSelector({ className, ...props }: LanguageSelectorProps) {
  const { locale } = useLocaleWithProps()
  const t = useTranslations('footer')
  const router = useRouter()

  const [isPending, startTransition] = useTransition()

  function handleOnChange(value: string) {
    startTransition(async () => {
      await setUserLocale(value)
      router.refresh()
    })
  }

  return (
    <Select disabled={isPending} onValueChange={handleOnChange} value={locale}>
      <SelectTrigger className={cn('w-32', className)} {...props}>
        <SelectValue placeholder={t('language')} />
      </SelectTrigger>

      <SelectContent>
        {locales.map((lang) => (
          <SelectItem key={lang.locale} value={lang.locale}>
            {lang.nativeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
