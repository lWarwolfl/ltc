import NextIntlProvider from '@/components/providers/next-intl-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import type { PropsWithChildren } from 'react'

const WrappedProviders = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <NextIntlProvider>{children}</NextIntlProvider>
      <Toaster />
    </ThemeProvider>
  )
}

export default WrappedProviders
