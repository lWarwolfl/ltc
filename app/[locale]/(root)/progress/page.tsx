import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getLocaleWithProps } from '@/i18n/i18n-configs'
import { getCourses } from '@/lib/content'
import { getSections, localizedField } from '@/lib/content'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ProgressDashboard } from '@/components/progress/progress-dashboard'

export const metadata: Metadata = { robots: { index: false, follow: true } }

export default async function ProgressPage() {
  const locale = await getLocaleWithProps()
  const t = await getTranslations('progress')
  const courses = await getCourses()

  const rows = await Promise.all(
    courses.map(async (course) => ({
      id: course.id,
      title: localizedField(course.title, locale.locale),
      slugs: (await getSections('en', course.id)).map((section) => section.slug),
    }))
  )

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/">{t('empty-cta')}</Link>
          </Button>
        </CardContent>
      </Card>

      <ProgressDashboard courses={rows} />
    </div>
  )
}
