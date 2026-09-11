import { defaultLocale, I18nLocaleArray, type I18nLocale } from '@/i18n/i18n-configs'
import { cookies } from 'next/headers'
import { cache } from 'react'

const getRequestConfig = cache(async () => {
  const cookie = await cookies()

  const stored = cookie.get('NEXT_LOCALE')?.value
  const locale = (
    stored && (I18nLocaleArray as readonly string[]).includes(stored)
      ? stored
      : process.env.DEFAULT_LANGUAGE || defaultLocale
  ) as I18nLocale

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})

export default getRequestConfig
