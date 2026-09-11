'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { downloadProgress, parseImport } from '@/lib/progress/transfer'
import { computeStats, useHasHydrated, useProgressStore } from '@/lib/store/progress.store'
import { Download, RefreshCw, Upload } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export type ProgressDashboardProps = {
  courses: { id: string; title: string; slugs: string[] }[]
}

export function ProgressDashboard({ courses }: ProgressDashboardProps) {
  const t = useTranslations('progress')
  const tc = useTranslations('global.actions')
  const hydrated = useHasHydrated()
  const lessons = useProgressStore((state) => state.lessons)
  const replaceAll = useProgressStore((state) => state.replaceAll)
  const reset = useProgressStore((state) => state.reset)

  const fileInput = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  const rows = courses.map((course) => ({
    id: course.id,
    title: course.title,
    stats: computeStats(lessons, course.id, course.slugs),
  }))

  const totals = rows.reduce(
    (acc, row) => ({
      total: acc.total + row.stats.total,
      completed: acc.completed + row.stats.completed,
      quizzes: acc.quizzes + row.stats.quizCount,
      score: acc.score + row.stats.quizScore,
    }),
    { total: 0, completed: 0, quizzes: 0, score: 0 }
  )

  const percent = totals.total ? Math.round((totals.completed / totals.total) * 100) : 0
  const average = totals.quizzes ? Math.round(totals.score / totals.quizzes) : 0

  async function handleImport(file: File) {
    try {
      replaceAll(parseImport(await file.text()))
      toast.success(t('imported'))
    } catch {
      toast.error(t('import-error'))
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  if (hydrated && !Object.keys(lessons).length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('empty-title')}</EmptyTitle>
          <EmptyDescription>{t('empty-description')}</EmptyDescription>
        </EmptyHeader>
        <Button asChild>
          <Link href="/">{t('empty-cta')}</Link>
        </Button>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{t('lessons-completed')}</span>
              <span className="text-muted-foreground">
                {totals.completed}/{totals.total}
              </span>
            </div>
            <Progress value={percent} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Metric label={t('lessons-completed')} value={`${percent}%`} />
            <Metric label={t('quizzes-taken')} value={String(totals.quizzes)} />
            <Metric label={t('average-score')} value={totals.quizzes ? `${average}%` : '—'} />
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            {rows.map((row) => (
              <div key={row.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.title}</span>
                  <span className="text-muted-foreground">
                    {row.stats.completed}/{row.stats.total}
                  </span>
                </div>
                <Progress value={row.stats.percent} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('export')}</CardTitle>
            <CardDescription>{t('export-description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                downloadProgress(lessons)
                toast.success(t('exported'))
              }}
            >
              <Download className="size-4" />
              {t('export')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('import')}</CardTitle>
            <CardDescription>{t('import-description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleImport(file)
              }}
            />
            <Button variant="outline" onClick={() => fileInput.current?.click()}>
              <Upload className="size-4" />
              {t('import')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('reset')}</CardTitle>
            <CardDescription>{t('reset-description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <RefreshCw className="size-4" />
                  {t('reset')}
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('reset-confirm')}</DialogTitle>
                  <DialogDescription>{t('reset-confirm-description')}</DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    {tc('cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      reset()
                      setOpen(false)
                      toast.success(t('reset-done'))
                    }}
                  >
                    {t('reset')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Badge variant="outline" className="self-start">
        {t('storage-note')}
      </Badge>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  )
}
