import { type Fonts, geist, vazirmatn } from '@/i18n/fonts'
import { useLocale } from 'next-intl'
import createMiddleware from 'next-intl/middleware'
import { getLocale } from 'next-intl/server'

export type Direction = 'rtl' | 'ltr'
export const I18nLocaleArray = ['en', 'fa'] as const
export type I18nLocale = (typeof I18nLocaleArray)[number]
export type LanguageCode = 'en-US' | 'fa-IR'

export type I18nLocaleProps = {
  direction: Direction
  locale: I18nLocale
  languageCode: LanguageCode
  font: Fonts
  name: string
  nativeName: string
}

export const defaultLocale: I18nLocale = 'en'

export const locales: I18nLocaleProps[] = [
  {
    locale: 'en',
    direction: 'ltr',
    languageCode: 'en-US',
    font: geist,
    name: 'English',
    nativeName: 'English',
  },
  {
    locale: 'fa',
    direction: 'rtl',
    languageCode: 'fa-IR',
    font: vazirmatn,
    name: 'Persian',
    nativeName: 'فارسی',
  },
]

export const intlMiddleware = createMiddleware({
  defaultLocale,
  locales: locales.map(({ locale }) => locale),
  localePrefix: 'never',
})

export async function getLocaleWithProps(): Promise<I18nLocaleProps> {
  const locale = (await getLocale()) as I18nLocale
  return getLocaleProps(locale)
}

export function getLocaleProps(locale: I18nLocale): I18nLocaleProps {
  return locales.find((loc) => loc.locale === locale) as I18nLocaleProps
}

export function useLocaleWithProps(): I18nLocaleProps {
  const locale = useLocale() as I18nLocale
  return getLocaleProps(locale)
}
