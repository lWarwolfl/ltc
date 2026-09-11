import { Geist, Geist_Mono, Vazirmatn } from 'next/font/google'

export const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
})

export type Fonts = typeof geist | typeof vazirmatn
