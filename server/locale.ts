'use server'

import { defaultLocale, I18nLocaleArray } from '@/i18n/i18n-configs'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'NEXT_LOCALE'

export async function setUserLocale(locale: string) {
  if (!(I18nLocaleArray as readonly string[]).includes(locale)) return
  ;(await cookies()).set(COOKIE_NAME, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
}

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale
}
