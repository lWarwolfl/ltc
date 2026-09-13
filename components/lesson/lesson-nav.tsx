import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export type LessonNavProps = {
  course: string
  previous?: { slug: string; title: string }
  next?: { slug: string; title: string }
}

export default async function LessonNav({ course, previous, next }: LessonNavProps) {
  const t = await getTranslations('lesson')

  if (!previous && !next) return null

  return (
    <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
      {previous ? (
        <Button variant="outline" asChild className="h-auto justify-start py-2">
          <Link href={`/courses/${course}/${previous.slug}`}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            <span className="flex flex-col items-start text-start">
              <span className="text-muted-foreground text-[11px]">{t('previous')}</span>
              <span className="max-w-60 truncate">{previous.title}</span>
            </span>
          </Link>
        </Button>
      ) : (
        <span />
      )}

      {next ? (
        <Button
          variant="outline"
          asChild
          className={cn('h-auto justify-end py-2', !previous && 'ms-auto')}
        >
          <Link href={`/courses/${course}/${next.slug}`}>
            <span className="flex flex-col items-end text-end">
              <span className="text-muted-foreground text-[11px]">{t('next')}</span>
              <span className="max-w-60 truncate">{next.title}</span>
            </span>
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
