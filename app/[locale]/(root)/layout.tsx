import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { locales } from '@/i18n/i18n-configs'
import type { I18nLocale } from '@/i18n/i18n-configs'
import { type PropsWithChildren } from 'react'

export const generateStaticParams = (): { locale: I18nLocale }[] =>
  locales.map(({ locale }) => ({ locale }))

export default async function MainLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-dvh p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 md:gap-8">
        <Header />

        {children}

        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    </main>
  )
}
