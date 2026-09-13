import WrappedProviders from '@/components/providers/wrapped-providers'
import { HOST, SITE_KEYWORDS, SITE_NAME } from '@/config'
import { getLocaleWithProps, locales } from '@/i18n/i18n-configs'
import { geistMono } from '@/i18n/fonts'
import { getCourses, localizedField } from '@/lib/content'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'
import { getTranslations } from 'next-intl/server'
import { PropsWithChildren } from 'react'
import '@/styles/globals.css'

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocaleWithProps()
  const [t, courses] = await Promise.all([getTranslations('global.meta'), getCourses()])
  const source = locales.find((item) => item.locale === 'en')

  const courseTitles = courses.map((course) => localizedField(course.title, locale.locale))
  const title = `${SITE_NAME} - ${t('title')}`
  const description = t('description', { courses: courseTitles.join(', ') })
  const keywords = [...SITE_KEYWORDS, ...courseTitles, locale.nativeName, locale.name]

  return {
    metadataBase: new URL(HOST),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    keywords,
    authors: [{ name: 'Sina Kheiri', url: 'https://github.com/lWarwolfl' }],
    creator: 'Sina Kheiri',
    alternates: { canonical: '/' },
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: locale.languageCode,
      alternateLocale: locales
        .filter((item) => item.locale !== locale.locale)
        .map((item) => item.languageCode),
      title,
      description,
      url: HOST,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: source ? { sourceLanguage: source.languageCode } : undefined,
    robots: { index: true, follow: true },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocaleWithProps()

  return (
    <html lang={locale.languageCode} dir={locale.direction} suppressHydrationWarning>
      <body
        className={cn(
          locale.font.variable,
          geistMono.variable,
          locale.font.className,
          'antialiased'
        )}
      >
        <WrappedProviders>{children}</WrappedProviders>
      </body>
    </html>
  )
}
