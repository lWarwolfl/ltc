'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useLocaleWithProps } from '@/i18n/i18n-configs'
import { cn } from '@/lib/utils'
import { bidiText } from '@/lib/content/bidi'
import type { QuizQuestion } from '@/lib/content/types'
import { useLessonProgress, useProgressStore } from '@/lib/store/progress.store'
import { Check, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

export type LessonQuizProps = {
  course: string
  slug: string
  quiz: QuizQuestion[]
}

export function LessonQuiz({ course, slug, quiz }: LessonQuizProps) {
  const t = useTranslations('quiz')
  const { direction } = useLocaleWithProps()
  const progress = useLessonProgress(course, slug)
  const saveQuiz = useProgressStore((state) => state.saveQuiz)

  const [answers, setAnswers] = useState<number[]>(() =>
    quiz.map((_, index) => progress.quiz?.answers[index] ?? -1)
  )
  const [submitted, setSubmitted] = useState(Boolean(progress.quiz))

  if (!quiz.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('empty')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const score = quiz.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0
  )

  function submit() {
    if (answers.some((answer) => answer < 0)) {
      toast.error(t('unanswered'))
      return
    }
    setSubmitted(true)
    saveQuiz(course, slug, answers, score, quiz.length)
    toast.success(t('saved'))
  }

  function retry() {
    setAnswers(quiz.map(() => -1))
    setSubmitted(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span>{t('title')}</span>
          {submitted ? (
            <span className="text-sm font-normal">
              {t('score')}: {score}/{quiz.length}
            </span>
          ) : null}
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {quiz.map((question, questionIndex) => {
          const chosen = answers[questionIndex]
          const correctAnswer = question.answer

          return (
            <div key={questionIndex} className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                {questionIndex + 1}. {bidiText(question.question)}
              </p>

              <RadioGroup
                dir={direction}
                value={chosen >= 0 ? String(chosen) : ''}
                onValueChange={(value) =>
                  setAnswers((current) =>
                    current.map((answer, index) =>
                      index === questionIndex ? Number(value) : answer
                    )
                  )
                }
                disabled={submitted}
                className="gap-2"
              >
                {question.options.map((option, optionIndex) => {
                  const isCorrect = submitted && optionIndex === correctAnswer
                  const isWrong =
                    submitted && optionIndex === chosen && optionIndex !== correctAnswer

                  return (
                    <div
                      key={optionIndex}
                      className={cn(
                        'flex items-center gap-3 rounded-md border px-3 py-2',
                        isCorrect && 'border-primary/60 bg-primary/10',
                        isWrong && 'border-destructive/60 bg-destructive/10'
                      )}
                    >
                      <RadioGroupItem
                        value={String(optionIndex)}
                        id={`${slug}-${questionIndex}-${optionIndex}`}
                      />
                      <label
                        htmlFor={`${slug}-${questionIndex}-${optionIndex}`}
                        className="flex-1 text-sm"
                      >
                        {bidiText(option)}
                      </label>
                      {isCorrect ? <Check className="text-primary size-4" /> : null}
                      {isWrong ? <X className="text-destructive size-4" /> : null}
                    </div>
                  )
                })}
              </RadioGroup>

              {submitted ? (
                <Alert className="items-start">
                  <AlertDescription className="flex flex-col gap-1">
                    <span className="text-foreground">
                      {chosen === correctAnswer ? t('correct') : t('incorrect')} — {t('answer')}:{' '}
                      {bidiText(question.options[correctAnswer])}
                    </span>
                    {question.explanation ? (
                      <span>
                        {t('explanation')}: {bidiText(question.explanation)}
                      </span>
                    ) : null}
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          )
        })}

        <div className="flex items-center gap-3">
          {submitted ? (
            <Button variant="outline" onClick={retry}>
              {t('retry')}
            </Button>
          ) : (
            <Button onClick={submit}>{t('submit')}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
