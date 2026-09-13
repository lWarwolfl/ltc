import { Button } from '@/components/ui/button'
import { locales } from '@/i18n/i18n-configs'
import { getStandalone } from '@/lib/content'
import { bidiText } from '@/lib/content/bidi'
import { getLocaleWithProps } from '@/i18n/i18n-configs'
import { BookOpen, Check, Download, FolderOpen, Play, Settings2 } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import LessonContent from '@/components/lesson/lesson-content'
import { LessonTasks } from '@/components/lesson/lesson-tasks'
import { LessonQuiz } from '@/components/lesson/lesson-quiz'
import { MarkComplete } from '@/components/lesson/mark-complete'

const SETUP_SLUG = 'setup'

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = await getLocaleWithProps()
  const lesson = await getStandalone(locale.locale, SETUP_SLUG)
  return lesson ? { title: lesson.title, description: lesson.summary } : {}
}

export default async function SetupPage() {
  const locale = await getLocaleWithProps()
  const t = await getTranslations('lesson')
  const lesson = await getStandalone(locale.locale, SETUP_SLUG)
  const source = locales.find((item) => item.locale === 'en')

  if (!lesson) notFound()

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground flex items-center gap-2 text-sm">
          <Settings2 className="size-4" />
          {t('source')}: {source?.name}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {bidiText(lesson.title)}
        </h1>
        {lesson.summary ? (
          <p className="text-muted-foreground max-w-3xl leading-7">{bidiText(lesson.summary)}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="https://code.visualstudio.com/download" target="_blank" rel="noreferrer">
            <Download className="size-4" />
            VS Code
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://nodejs.org" target="_blank" rel="noreferrer">
            <Play className="size-4" />
            Node.js
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer"
            target="_blank"
            rel="noreferrer"
          >
            <FolderOpen className="size-4" />
            Live Server
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode"
            target="_blank"
            rel="noreferrer"
          >
            <Check className="size-4" />
            Prettier
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=lokalise.i18n-ally"
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen className="size-4" />
            i18n Ally
          </a>
        </Button>
      </div>

      <LessonContent blocks={lesson.blocks} />

      <MarkComplete course={SETUP_SLUG} slug={SETUP_SLUG} />

      <LessonTasks course={SETUP_SLUG} slug={SETUP_SLUG} tasks={lesson.tasks ?? []} />

      <LessonQuiz course={SETUP_SLUG} slug={SETUP_SLUG} quiz={lesson.quiz ?? []} />
    </div>
  )
}
