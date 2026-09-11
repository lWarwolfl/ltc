export const PORT = process.env.PORT || 3000

export const HOST =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : `http://localhost:${PORT}`)

export const SITE_NAME = 'Learn To Code'
export const SITE_SHORT_NAME = 'LTC'

/** Source language of the course material. Translations are layered on top of it. */
export const CONTENT_SOURCE_LOCALE = 'en'

export const SITE_KEYWORDS = [
  'learn to code',
  'learn programming',
  'programming course',
  'web development course',
  'programming for beginners',
  'آموزش برنامه نویسی',
  'آموزش کدنویسی',
]

export const BRAND_COLOR = '#E34F26'

export const PROGRESS_FILE = 'ltc-progress.json'
