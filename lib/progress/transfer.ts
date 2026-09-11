import { emptyLesson, type LessonProgress, type ProgressData } from '@/lib/store/progress.store'

export const PROGRESS_FILE = 'ltc-progress.json'

type ProgressFile = {
  app: 'ltc'
  version: number
  exportedAt: string
  lessons: ProgressData
}

export function buildExport(lessons: ProgressData): string {
  const file: ProgressFile = {
    app: 'ltc',
    version: 1,
    exportedAt: new Date().toISOString(),
    lessons,
  }
  return JSON.stringify(file, null, 2)
}

function isQuiz(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const quiz = value as Record<string, unknown>
  return (
    Array.isArray(quiz.answers) &&
    quiz.answers.every((answer) => typeof answer === 'number') &&
    typeof quiz.score === 'number' &&
    typeof quiz.total === 'number' &&
    typeof quiz.updatedAt === 'number'
  )
}

function isLessonProgress(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const lesson = value as Record<string, unknown>
  return (
    typeof lesson.completed === 'boolean' &&
    (lesson.completedAt === null || typeof lesson.completedAt === 'number') &&
    Array.isArray(lesson.tasks) &&
    lesson.tasks.every((task) => typeof task === 'number') &&
    (lesson.quiz === null || isQuiz(lesson.quiz))
  )
}

export function parseImport(text: string): ProgressData {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('invalid-json')
  }

  if (typeof parsed !== 'object' || parsed === null) throw new Error('invalid-shape')
  const file = parsed as Record<string, unknown>
  if (typeof file.lessons !== 'object' || file.lessons === null) throw new Error('invalid-shape')

  const lessons = file.lessons as Record<string, unknown>
  const clean: ProgressData = {}

  for (const [key, value] of Object.entries(lessons)) {
    if (!key.includes('/') || !isLessonProgress(value)) continue
    const lesson = value as LessonProgress
    clean[key] = {
      ...emptyLesson(),
      completed: lesson.completed,
      completedAt: lesson.completedAt,
      tasks: lesson.tasks,
      quiz: lesson.quiz,
    }
  }

  if (!Object.keys(clean).length) throw new Error('no-lessons')
  return clean
}

export function downloadProgress(lessons: ProgressData) {
  const blob = new Blob([buildExport(lessons)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = PROGRESS_FILE
  link.click()
  URL.revokeObjectURL(url)
}
