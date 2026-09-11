'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export type CodeBlockProps = {
  code: string
  caption?: string | null
  className?: string
}

export function CodeBlock({ code, caption, className }: CodeBlockProps) {
  const t = useTranslations('global.actions')
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <figure className={cn('bg-muted/40 group relative overflow-hidden rounded-lg border', className)}>
      {caption ? (
        <figcaption className="bg-muted/60 text-muted-foreground border-b px-3 py-1.5 text-xs font-medium">
          {caption}
        </figcaption>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={copy}
        aria-label={t('copy')}
        className="absolute end-2 top-2 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>

      <pre dir="ltr" className="overflow-x-auto p-4 text-start text-sm leading-6">
        <code className="font-mono">{code}</code>
      </pre>
    </figure>
  )
}
