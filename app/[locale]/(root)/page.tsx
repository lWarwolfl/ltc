import { CourseCard } from '@/components/course/course-card'
import { OverallProgress } from '@/components/progress/overall-progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getLocaleWithProps, locales } from '@/i18n/i18n-configs'
import { getCourses, getSections, localizedField } from '@/lib/content'
import { BookOpen, Rocket } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function HomePage() {
  const locale = await getLocaleWithProps()
  const t = await getTranslations('landing')
  const tc = await getTranslations('course')
  const courses = await getCourses()

  const withSections = await Promise.all(
    courses.map(async (course) => ({
      course,
      sections: await getSections(locale.locale, course.id),
    }))
  )

  const source = locales.find((item) => item.locale === 'en')
  const untranslated = withSections.some(({ course, sections }) =>
    sections.some((section) => section.translated === false && course.id !== 'en')
  )

  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-7">{t('description')}</p>

        {untranslated && source ? (
          <p className="text-muted-foreground text-sm">
            {t('untranslated-note', { source: source.name })}
          </p>
        ) : null}

        <OverallProgress
          courses={withSections.map(({ course, sections }) => ({
            id: course.id,
            slugs: sections.map((section) => section.slug),
          }))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-xl font-medium">
          <BookOpen className="text-primary size-5" />
          {t('courses')}
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {withSections.map(({ course, sections }) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={localizedField(course.title, locale.locale)}
              description={localizedField(course.description, locale.locale)}
              accent={course.accent}
              slugs={sections.map((section) => section.slug)}
              firstSlug={sections[0]?.slug ?? null}
            />
          ))}
        </div>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="text-primary size-5" />
              {t('setup-title')}
            </CardTitle>
            <CardDescription>{t('setup-description')}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/setup">{t('setup-cta')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/progress">{t('progress-cta')}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <p className="text-muted-foreground sr-only">{tc('sections')}</p>
    </div>
  )
}
