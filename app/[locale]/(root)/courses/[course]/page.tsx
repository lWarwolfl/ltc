import { SectionList } from '@/components/course/section-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getLocaleWithProps } from '@/i18n/i18n-configs'
import { getCourse, getCourses, getSections, localizedField } from '@/lib/content'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export type CoursePageProps = {
  params: Promise<{ course: string }>
}

export const generateStaticParams = async () => {
  const courses = await getCourses()
  return courses.map(({ id }) => ({ course: id }))
}

export const generateMetadata = async ({ params }: CoursePageProps): Promise<Metadata> => {
  const { course: courseId } = await params
  const locale = await getLocaleWithProps()
  const course = await getCourse(courseId)
  if (!course) return {}

  const title = localizedField(course.title, locale.locale)
  const description = localizedField(course.description, locale.locale)

  return { title, description, openGraph: { title, description }, twitter: { title, description } }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { course: courseId } = await params
  const locale = await getLocaleWithProps()
  const t = await getTranslations('course')
  const course = await getCourse(courseId)
  if (!course) notFound()

  const sections = await getSections(locale.locale, course.id)
  const pending = sections.some((section) => section.translated === false)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild className="self-start">
          <Link href="/">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t('back')}
          </Link>
        </Button>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="h-1.5 w-16 rounded-full" style={{ backgroundColor: course.accent }} />
            <h1 className="text-3xl font-semibold tracking-tight">
              {localizedField(course.title, locale.locale)}
            </h1>
            <p className="text-muted-foreground max-w-2xl leading-7">
              {localizedField(course.description, locale.locale)}
            </p>
          </div>

          {sections[0] ? (
            <Button asChild>
              <Link href={`/courses/${course.id}/${sections[0].slug}`}>
                {t('start')}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          ) : null}
        </div>

        {pending ? (
          <p className="text-muted-foreground border-primary/40 border-s-2 ps-3 text-sm">
            {t('translation-pending')}
          </p>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="text-primary size-5" />
            {t('lessons')}
          </CardTitle>
          <CardDescription>{t('lessons-count', { count: sections.length })}</CardDescription>
        </CardHeader>

        <CardContent>
          <SectionList course={course.id} sections={sections} />
        </CardContent>
      </Card>
    </div>
  )
}
