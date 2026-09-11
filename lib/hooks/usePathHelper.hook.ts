'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function usePathHelper() {
  const pathname = usePathname()

  const isCurrentPath = useCallback(
    (path: string) => (path === '/' ? pathname === '/' : pathname.startsWith(path)),
    [pathname]
  )

  return { pathname, isCurrentPath }
}
