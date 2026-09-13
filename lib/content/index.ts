import { CONTENT_SOURCE_LOCALE } from '@/config'
import type { Course, Lesson, ParagraphBlock, SectionMeta } from '@/lib/content/types'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { cache } from 'react'

const CONTENT = join(process.cwd(), 'content')
export const defaultContentLocale = CONTENT_SOURCE_LOCALE

/** Reads a per-locale record ({en: "...", fa: "..."}) falling back to the source locale. */
export function localizedField(record: Record<string, string>, locale: string): string {
  return record[locale] ?? record[defaultContentLocale] ?? Object.values(record)[0] ?? ''
}

export function firstParagraph(lesson: Lesson): string {
  const block = lesson.blocks.find((item): item is ParagraphBlock => item.type === 'p')
  return block?.text ?? ''
}

async function readJson<T>(path: string): Promise<T | null> {
  if (!existsSync(path)) return null
  return JSON.parse(await readFile(path, 'utf8')) as T
}

export const getCourses = cache(async (): Promise<Course[]> => {
  const courses = await readJson<Course[]>(join(CONTENT, 'courses.json'))
  return (courses ?? []).sort((a, b) => a.order - b.order)
})

export const getCourse = cache(async (id: string): Promise<Course | undefined> => {
  return (await getCourses()).find((course) => course.id === id)
})

export const getSections = cache(async (locale: string, course: string): Promise<SectionMeta[]> => {
  const translated =
    locale === defaultContentLocale
      ? null
      : await readJson<SectionMeta[]>(join(CONTENT, locale, course, 'index.json'))
  const base = await readJson<SectionMeta[]>(
    join(CONTENT, defaultContentLocale, course, 'index.json')
  )
  if (!base) return []

  if (!translated) return base
  const titles = new Map(translated.map((section) => [section.slug, section.title]))
  return base.map((section) => ({
    ...section,
    title: titles.get(section.slug) ?? section.title,
    translated: titles.has(section.slug),
  }))
})

export const getLesson = cache(
  async (locale: string, course: string, slug: string): Promise<Lesson | null> => {
    if (locale !== defaultContentLocale) {
      const translated = await readJson<Lesson>(join(CONTENT, locale, course, `${slug}.json`))
      if (translated) return translated
    }
    return readJson<Lesson>(join(CONTENT, defaultContentLocale, course, `${slug}.json`))
  }
)

export const getStandalone = cache(async (locale: string, slug: string): Promise<Lesson | null> => {
  if (locale !== defaultContentLocale) {
    const translated = await readJson<Lesson>(join(CONTENT, locale, `${slug}.json`))
    if (translated) return translated
  }
  return readJson<Lesson>(join(CONTENT, defaultContentLocale, `${slug}.json`))
})

export const getAllCourseSections = cache(async (course: string): Promise<SectionMeta[]> => {
  return (await getSections(defaultContentLocale, course)) ?? []
})
