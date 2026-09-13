import LessonContent from '@/components/lesson/lesson-content'
import LessonNav from '@/components/lesson/lesson-nav'
import CodePractice from '@/components/lesson/code-practice'
import { LessonQuiz } from '@/components/lesson/lesson-quiz'
import { LessonTasks } from '@/components/lesson/lesson-tasks'
import { MarkComplete } from '@/components/lesson/mark-complete'
import { SectionList } from '@/components/course/section-list'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getLocaleWithProps, locales } from '@/i18n/i18n-configs'
import {
  getCourse,
  getCourses,
  getLesson,
  getSections,
  localizedField,
  firstParagraph,
} from '@/lib/content'
import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export type LessonPageProps = {
  params: Promise<{ course: string; slug: string }>
}

export const generateStaticParams = async () => {
  const courses = await getCourses()
  const params = await Promise.all(
    courses.map(async (course) => {
      const sections = await getSections('en', course.id)
      return sections.map((section) => ({ course: course.id, slug: section.slug }))
    })
  )
  return params.flat()
}

export const generateMetadata = async ({ params }: LessonPageProps): Promise<Metadata> => {
  const { course: courseId, slug } = await params
  const locale = await getLocaleWithProps()
  const [course, lesson] = await Promise.all([
    getCourse(courseId),
    getLesson(locale.locale, courseId, slug),
  ])
  if (!course || !lesson) return {}

  const courseTitle = localizedField(course.title, locale.locale)
  const description = lesson.summary ?? firstParagraph(lesson)
  const title = `${lesson.title} | ${courseTitle}`

  return {
    title: lesson.title,
    description,
    alternates: { canonical: `/courses/${courseId}/${slug}` },
    openGraph: { title, description, type: 'article' },
    twitter: { title, description },
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { course: courseId, slug } = await params
  const locale = await getLocaleWithProps()
  const t = await getTranslations('lesson')
  const course = await getCourse(courseId)
  if (!course) notFound()

  const [lesson, sections] = await Promise.all([
    getLesson(locale.locale, courseId, slug),
    getSections(locale.locale, courseId),
  ])
  if (!lesson) notFound()

  const index = sections.findIndex((section) => section.slug === slug)
  const previous = index > 0 ? sections[index - 1] : undefined
  const next = index >= 0 && index < sections.length - 1 ? sections[index + 1] : undefined
  const translated = locale.locale === 'en' || Boolean(sections[index]?.translated)
  const source = locales.find((item) => item.locale === 'en')

  return (
    <div className="flex flex-1 flex-col gap-6 lg:flex-row">
      <article className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
            <Link href="/" className="hover:text-foreground">
              {course.id.toUpperCase()}
            </Link>
            <span>/</span>
            <Link href={`/courses/${course.id}`} className="hover:text-foreground">
              {localizedField(course.title, locale.locale)}
            </Link>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{lesson.title}</h1>

          <div className="flex flex-wrap items-center gap-2">
            {index >= 0 ? (
              <Badge variant="secondary">
                {index + 1}/{sections.length}
              </Badge>
            ) : null}
            {translated ? null : source ? (
              <Badge variant="outline">{t('fallback-note')}</Badge>
            ) : null}
            {lesson.url ? (
              <Button variant="link" size="sm" asChild>
                <a href={`https://www.w3schools.com${lesson.url}`} target="_blank" rel="noreferrer">
                  {t('source')}
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <CodePractice fileName={`${slug}.${course.id}`} />

        {lesson.objectives?.length ? (
          <Card>
            <CardContent className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t('objectives')}</span>
              <ul className="text-muted-foreground flex list-disc flex-col gap-1 ps-5 text-sm">
                {lesson.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}

        <LessonContent blocks={lesson.blocks} />

        <MarkComplete course={course.id} slug={slug} />

        <LessonTasks course={course.id} slug={slug} tasks={lesson.tasks ?? []} />

        <LessonQuiz course={course.id} slug={slug} quiz={lesson.quiz ?? []} />

        <LessonNav
          course={course.id}
          previous={previous ? { slug: previous.slug, title: previous.title } : undefined}
          next={next ? { slug: next.slug, title: next.title } : undefined}
        />
      </article>

      <aside className="lg:w-72 lg:shrink-0">
        <div className="lg:sticky lg:top-[5.5rem] lg:h-[calc(100dvh-7rem)]">
          <SectionList course={course.id} sections={sections} currentSlug={slug} scrollable />
        </div>
      </aside>
    </div>
  )
}
