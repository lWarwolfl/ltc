'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useCourseStats } from '@/lib/store/progress.store'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export type CourseCardProps = {
  id: string
  title: string
  description: string
  accent: string
  slugs: string[]
  firstSlug: string | null
}

export function CourseCard({ id, title, description, accent, slugs, firstSlug }: CourseCardProps) {
  const t = useTranslations('course')
  const stats = useCourseStats(id, slugs)

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />

      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{title}</span>
          <Badge variant="secondary">{t('lessons-count', { count: stats.total })}</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {stats.completed}/{stats.total} {t('completed').toLowerCase()}
          </span>
          <span className="font-medium">{stats.percent}%</span>
        </div>
        <Progress value={stats.percent} />
      </CardContent>

      <CardFooter className="justify-end">
        <Button asChild>
          <Link href={`/courses/${id}${firstSlug ? `/${firstSlug}` : ''}`}>
            {stats.completed ? t('continue') : t('start')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
