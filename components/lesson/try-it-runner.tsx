'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

function buildDoc(code: string, lang: string) {
  if (/<html[\s>]/i.test(code)) return code
  if (lang === 'css')
    return `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${code}\n</style>\n</head>\n<body>\n<h1>Demo heading</h1>\n<p>Demo paragraph.</p>\n</body>\n</html>`
  if (lang === 'js')
    return `<!DOCTYPE html>\n<html>\n<body>\n<p id="demo">Demo output appears here.</p>\n<script>\n${code}\n</script>\n</body>\n</html>`
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<!DOCTYPE html>\n<html>\n<body>\n<pre>${escaped}</pre>\n</body>\n</html>`
}

export type TryItRunnerProps = {
  code: string
  lang: string
}

export function TryItRunner({ code, lang }: TryItRunnerProps) {
  const t = useTranslations('lesson')
  const actions = useTranslations('global.actions')
  const initial = buildDoc(code, lang)
  const [open, setOpen] = useState(false)
  const [doc, setDoc] = useState(initial)
  const [srcDoc, setSrcDoc] = useState(initial)

  useEffect(() => {
    if (!open) return
    setDoc(initial)
    setSrcDoc(initial)
    document.body.style.overflow = 'hidden'
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', close)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', close)
    }
    // ponytail: keyed on open only; code/lang are fixed per lesson mount
  }, [open])

  if (!open)
    return (
      <div>
        <Button variant="outline" size="sm" type="button" onClick={() => setOpen(true)}>
          {t('try-it')}
          <Play className="size-4" />
        </Button>
      </div>
    )

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <Button variant="outline" size="sm" type="button" autoFocus onClick={() => setOpen(false)}>
          <ArrowLeft className="size-4" />
          {t('try-it-back')}
        </Button>
        <span className="text-muted-foreground ms-1 text-sm font-medium">{t('try-it')}</span>
        <span className="flex-1" />
        <Button variant="ghost" size="sm" type="button" onClick={() => setDoc(initial)}>
          <RotateCcw className="size-4" />
          {actions('reset')}
        </Button>
        <Button size="sm" type="button" onClick={() => setSrcDoc(doc)}>
          <Play className="size-4" />
          {t('try-it-run')}
        </Button>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-2">
        <div className="flex min-h-0 flex-col border-b md:border-e md:border-b-0">
          <p className="text-muted-foreground border-b px-4 py-1.5 text-xs font-medium">
            {t('try-it-code')}
          </p>
          <textarea
            dir="ltr"
            value={doc}
            onChange={(event) => setDoc(event.target.value)}
            spellCheck={false}
            className="min-h-40 flex-1 resize-none bg-transparent p-4 font-mono text-sm leading-6 outline-none md:min-h-0"
          />
        </div>
        <div className="flex min-h-0 flex-col">
          <p className="text-muted-foreground border-b px-4 py-1.5 text-xs font-medium">
            {t('try-it-result')}
          </p>
          <iframe
            title={t('try-it-result')}
            sandbox="allow-scripts"
            srcDoc={srcDoc}
            className="min-h-60 flex-1 bg-white md:min-h-0"
          />
        </div>
      </div>
    </div>
  )
}
