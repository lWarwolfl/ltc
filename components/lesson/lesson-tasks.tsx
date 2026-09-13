'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { bidiText } from '@/lib/content/bidi'
import type { Task } from '@/lib/content/types'
import { useLessonProgress, useProgressStore } from '@/lib/store/progress.store'
import { useTranslations } from 'next-intl'

export type LessonTasksProps = {
  course: string
  slug: string
  tasks: Task[]
}

export function LessonTasks({ course, slug, tasks }: LessonTasksProps) {
  const t = useTranslations('tasks')
  const progress = useLessonProgress(course, slug)
  const toggleTask = useProgressStore((state) => state.toggleTask)

  if (!tasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('empty')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{t('title')}</span>
          <span className="text-muted-foreground text-sm font-normal">
            {t('done', { done: progress.tasks.length, total: tasks.length })}
          </span>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {tasks.map((task, index) => {
          const id = `task-${course}-${slug}-${index}`
          const checked = progress.tasks.includes(index)

          return (
            <div key={id} className="flex items-start gap-3">
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => toggleTask(course, slug, index)}
              />
              <div className="flex flex-col gap-1">
                <Label htmlFor={id} className="leading-6 font-normal">
                  {bidiText(task.prompt)}
                </Label>
                {task.hint ? (
                  <span className="text-muted-foreground text-sm">
                    {t('hint')}: {bidiText(task.hint)}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
