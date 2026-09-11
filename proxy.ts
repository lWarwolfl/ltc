import { intlMiddleware } from '@/i18n/i18n-configs'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api/|_next/|.*\\..*).*)'],
}
