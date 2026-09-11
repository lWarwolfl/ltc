'use client'

import { Button } from '@/components/ui/button'
import { useHasHydrated, useLessonProgress, useProgressStore } from '@/lib/store/progress.store'
import { Check, Circle } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

export type MarkCompleteProps = {
  course: string
  slug: string
}

export function MarkComplete({ course, slug }: MarkCompleteProps) {
  const t = useTranslations('lesson')
  const hydrated = useHasHydrated()
  const progress = useLessonProgress(course, slug)
  const markComplete = useProgressStore((state) => state.markComplete)
  const format = useFormatter()

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant={progress.completed ? 'secondary' : 'default'}
        disabled={!hydrated}
        onClick={() => markComplete(course, slug, !progress.completed)}
      >
        {progress.completed ? <Check className="size-4" /> : <Circle className="size-4" />}
        {progress.completed ? t('completed') : t('mark-complete')}
      </Button>

      {hydrated && progress.completedAt ? (
        <span className="text-muted-foreground text-xs">
          {t('completed-at', {
            date: format.dateTime(new Date(progress.completedAt), { dateStyle: 'medium' }),
          })}
        </span>
      ) : null}
    </div>
  )
}
