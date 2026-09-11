import { HOST } from '@/config'
import { getCourses, getSections } from '@/lib/content'
import { locales } from '@/i18n/i18n-configs'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await getCourses()
  const entries: MetadataRoute.Sitemap = locales.flatMap(({ locale }) => [
    { url: `${HOST}/${locale}`, changeFrequency: 'weekly', priority: 1 },
    { url: `${HOST}/${locale}/setup`, changeFrequency: 'monthly', priority: 0.6 },
  ])

  for (const course of courses) {
    const sections = await getSections('en', course.id)
    entries.push({ url: `${HOST}/courses/${course.id}`, changeFrequency: 'weekly', priority: 0.9 })

    for (const section of sections) {
      entries.push({
        url: `${HOST}/courses/${course.id}/${section.slug}`,
        changeFrequency: 'monthly',
        priority: 0.7,
        lastModified: new Date(),
      })
    }
  }

  return entries
}
