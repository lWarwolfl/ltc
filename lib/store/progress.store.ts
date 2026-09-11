'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useEffect, useMemo, useState } from 'react'

export type QuizResult = {
  answers: number[]
  score: number
  total: number
  updatedAt: number
}

export type LessonProgress = {
  completed: boolean
  completedAt: number | null
  tasks: number[]
  quiz: QuizResult | null
}

export type ProgressData = Record<string, LessonProgress>

export const lessonKey = (course: string, slug: string) => `${course}/${slug}`

const EMPTY_LESSON: LessonProgress = { completed: false, completedAt: null, tasks: [], quiz: null }

export const emptyLesson = (): LessonProgress => ({ ...EMPTY_LESSON })

type ProgressStore = {
  lessons: ProgressData
  markComplete: (course: string, slug: string, completed: boolean) => void
  toggleTask: (course: string, slug: string, taskIndex: number) => void
  saveQuiz: (course: string, slug: string, answers: number[], score: number, total: number) => void
  replaceAll: (lessons: ProgressData) => void
  reset: () => void
}

function patch(
  set: (fn: (state: ProgressStore) => Partial<ProgressStore>) => void,
  key: string,
  update: (lesson: LessonProgress) => LessonProgress
) {
  set((state) => {
    const current = state.lessons[key] ?? EMPTY_LESSON
    return { lessons: { ...state.lessons, [key]: update(current) } }
  })
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      lessons: {},

      markComplete: (course, slug, completed) =>
        patch(set, lessonKey(course, slug), (lesson) => ({
          ...lesson,
          completed,
          completedAt: completed ? Date.now() : null,
        })),

      toggleTask: (course, slug, taskIndex) =>
        patch(set, lessonKey(course, slug), (lesson) => ({
          ...lesson,
          tasks: lesson.tasks.includes(taskIndex)
            ? lesson.tasks.filter((index) => index !== taskIndex)
            : [...lesson.tasks, taskIndex].sort((a, b) => a - b),
        })),

      saveQuiz: (course, slug, answers, score, total) =>
        patch(set, lessonKey(course, slug), (lesson) => ({
          ...lesson,
          quiz: { answers, score, total, updatedAt: Date.now() },
        })),

      replaceAll: (lessons) => set(() => ({ lessons })),

      reset: () => set(() => ({ lessons: {} })),
    }),
    {
      name: 'ltc-progress',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useLessonProgress(course: string, slug: string): LessonProgress {
  const key = lessonKey(course, slug)
  const lesson = useProgressStore((state) => state.lessons[key])
  return lesson ?? EMPTY_LESSON
}

export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (useProgressStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useProgressStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}

export type CourseStats = {
  total: number
  completed: number
  percent: number
  quizScore: number
  quizCount: number
}

export function computeStats(lessons: ProgressData, course: string, slugs: string[]): CourseStats {
  let completed = 0
  let quizScore = 0
  let quizCount = 0

  for (const slug of slugs) {
    const lesson = lessons[lessonKey(course, slug)]
    if (!lesson) continue
    if (lesson.completed) completed += 1
    if (lesson.quiz && lesson.quiz.total > 0) {
      quizScore += (lesson.quiz.score / lesson.quiz.total) * 100
      quizCount += 1
    }
  }

  return {
    total: slugs.length,
    completed,
    percent: slugs.length ? Math.round((completed / slugs.length) * 100) : 0,
    quizScore: quizCount ? Math.round(quizScore / quizCount) : 0,
    quizCount,
  }
}

export function useCourseStats(course: string, slugs: string[]): CourseStats {
  const lessons = useProgressStore((state) => state.lessons)
  return useMemo(() => computeStats(lessons, course, slugs), [lessons, course, slugs])
}
