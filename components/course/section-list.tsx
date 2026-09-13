'use client'

import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslations } from 'next-intl'
import { lessonKey, useProgressStore } from '@/lib/store/progress.store'
import type { SectionMeta } from '@/lib/content/types'
import { bidiText } from '@/lib/content/bidi'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Link from 'next/link'

export type SectionListProps = {
  course: string
  sections: SectionMeta[]
  currentSlug?: string
  scrollable?: boolean
}

export function SectionList({
  course,
  sections,
  currentSlug,
  scrollable = false,
}: SectionListProps) {
  const t = useTranslations('lesson')
  const lessons = useProgressStore((state) => state.lessons)

  const completed = sections.filter(
    (section) => lessons[lessonKey(course, section.slug)]?.completed
  )
  const percent = sections.length ? Math.round((completed.length / sections.length) * 100) : 0

  const list = (
    <ol className={cn('flex flex-col gap-0.5', scrollable && 'pe-3')}>
      {sections.map((section, index) => {
        const progress = lessons[lessonKey(course, section.slug)]
        const isCurrent = section.slug === currentSlug

        return (
          <li key={section.slug}>
            <Link
              href={`/courses/${course}/${section.slug}`}
              className={cn(
                'hover:bg-accent flex items-start gap-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                isCurrent && 'bg-accent font-medium'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px]',
                  progress?.completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {progress?.completed ? <Check className="size-3" /> : index + 1}
              </span>
              <span className="flex-1">{bidiText(section.title)}</span>
              {section.translated === false ? (
                <span className="text-muted-foreground text-[11px]">{t('source')}</span>
              ) : null}
            </Link>
          </li>
        )
      })}
    </ol>
  )

  return (
    <div className={cn('flex flex-col gap-3', scrollable && 'h-full min-h-0')}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{t('sections')}</span>
          <span className="text-muted-foreground">
            {completed.length}/{sections.length}
          </span>
        </div>
        <Progress value={percent} />
      </div>

      {scrollable ? <ScrollArea className="min-h-0 flex-1">{list}</ScrollArea> : list}
    </div>
  )
}
