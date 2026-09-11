'use client'

import { Progress } from '@/components/ui/progress'
import { computeStats, useProgressStore } from '@/lib/store/progress.store'
import { useTranslations } from 'next-intl'

export type OverallProgressProps = {
  courses: { id: string; slugs: string[] }[]
}

export function OverallProgress({ courses }: OverallProgressProps) {
  const t = useTranslations('landing')
  const lessons = useProgressStore((state) => state.lessons)

  const totals = courses.reduce(
    (acc, course) => {
      const stats = computeStats(lessons, course.id, course.slugs)
      return { total: acc.total + stats.total, completed: acc.completed + stats.completed }
    },
    { total: 0, completed: 0 }
  )

  const percent = totals.total ? Math.round((totals.completed / totals.total) * 100) : 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{t('overall-progress')}</span>
        <span className="text-muted-foreground">
          {totals.completed}/{totals.total}
        </span>
      </div>
      <Progress value={percent} />
    </div>
  )
}
