import { CodeBlock } from '@/components/lesson/code-block'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { bidiText } from '@/lib/content/bidi'
import type { Block } from '@/lib/content/types'
import { ExternalLink, Info, Lightbulb, TriangleAlert } from 'lucide-react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const NOTE_STYLES = {
  note: { icon: Info, className: 'border-border' },
  tip: { icon: Lightbulb, className: 'border-primary/40' },
  warning: { icon: TriangleAlert, className: 'border-destructive/40' },
} as const

export type LessonContentProps = {
  blocks: Block[]
}

export default async function LessonContent({ blocks }: LessonContentProps) {
  const t = await getTranslations('lesson')

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`

        switch (block.type) {
          case 'h1':
            return null
          case 'h2':
            return (
              <h2 key={key} className="mt-4 scroll-mt-24 text-xl font-semibold tracking-tight">
                {bidiText(block.text)}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={key} className="text-base font-semibold">
                {bidiText(block.text)}
              </h3>
            )
          case 'p':
            return (
              <p key={key} className="text-muted-foreground text-[15px] leading-7">
                {bidiText(block.text)}
              </p>
            )
          case 'list': {
            const List = block.ordered ? 'ol' : 'ul'
            return (
              <List
                key={key}
                className={cn(
                  'text-muted-foreground flex flex-col gap-1.5 ps-6 text-[15px] leading-7',
                  block.ordered ? 'list-decimal' : 'list-disc'
                )}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{bidiText(item)}</li>
                ))}
              </List>
            )
          }
          case 'code':
            return <CodeBlock key={key} code={block.text} caption={block.caption} />
          case 'tryit':
            return (
              <div key={key}>
                <Button variant="outline" size="sm" asChild>
                  <a href={block.url} target="_blank" rel="noreferrer">
                    {t('try-it')}
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </div>
            )
          case 'note': {
            const style = NOTE_STYLES[block.variant]
            const Icon = style.icon
            return (
              <Alert key={key} className={cn('items-start', style.className)}>
                <Icon className="size-4" />
                <AlertDescription className="whitespace-pre-line">
                  {bidiText(block.text)}
                </AlertDescription>
              </Alert>
            )
          }
          case 'table':
            return (
              <div key={key} className="overflow-x-auto rounded-lg border">
                <table className="w-full text-start text-sm">
                  {block.headers.length ? (
                    <thead className="bg-muted/60">
                      <tr>
                        {block.headers.map((header, headerIndex) => (
                          <th key={headerIndex} className="px-3 py-2 text-start font-medium">
                            {bidiText(header)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  ) : null}
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="text-muted-foreground px-3 py-2 align-top">
                            {bidiText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'image':
            return (
              <Image
                key={key}
                src={block.src}
                alt={block.alt}
                width={480}
                height={270}
                className="h-auto max-w-full rounded-lg border"
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
