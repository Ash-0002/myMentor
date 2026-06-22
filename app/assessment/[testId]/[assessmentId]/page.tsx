"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { apiClient } from "@/lib/api-client"
import {
  fetchQuestionsPage,
  mergeQuestions,
  type AssessmentQuestionWithOptions,
} from "@/lib/assessment-test"

const PREFETCH_THRESHOLD = 2

export default function AssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const parsedTestId = Number(Array.isArray(params.testId) ? params.testId[0] : params.testId)
  const assessmentId = String(Array.isArray(params.assessmentId) ? params.assessmentId[0] : params.assessmentId || "")
  const configuredDurationMinutes = Number(searchParams.get("duration") || 30)

  const [questions, setQuestions] = useState<AssessmentQuestionWithOptions[]>([])
  const [totalQuestionCount, setTotalQuestionCount] = useState(0)
  const [nextPagePath, setNextPagePath] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(
    Math.max(60, (Number.isFinite(configuredDurationMinutes) ? configuredDurationMinutes : 30) * 60),
  )

  const nextPagePathRef = useRef<string | null>(null)
  const isLoadingMoreRef = useRef(false)
  const questionsRef = useRef<AssessmentQuestionWithOptions[]>([])

  useEffect(() => {
    nextPagePathRef.current = nextPagePath
  }, [nextPagePath])

  useEffect(() => {
    questionsRef.current = questions
  }, [questions])

  const loadMoreQuestions = useCallback(async (): Promise<boolean> => {
    const path = nextPagePathRef.current
    if (!path || isLoadingMoreRef.current) return false

    isLoadingMoreRef.current = true
    setIsLoadingMore(true)
    try {
      const page = await fetchQuestionsPage(parsedTestId, path)
      setQuestions((prev) => mergeQuestions(prev, page.questions))
      setNextPagePath(page.nextPath)
      nextPagePathRef.current = page.nextPath
      setTotalQuestionCount((prev) => Math.max(prev, page.totalCount))
      return page.questions.length > 0
    } catch (err) {
      console.error("[assessment] Failed to load more questions:", err)
      setError("Unable to load more questions. Please try again.")
      return false
    } finally {
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [parsedTestId])

  const ensureQuestionsUpTo = useCallback(
    async (targetIndex: number) => {
      while (
        questionsRef.current.length <= targetIndex &&
        nextPagePathRef.current &&
        !isLoadingMoreRef.current
      ) {
        const loaded = await loadMoreQuestions()
        if (!loaded) break
      }
    },
    [loadMoreQuestions],
  )

  useEffect(() => {
    const loadInitial = async () => {
      if (!Number.isFinite(parsedTestId) || parsedTestId <= 0) {
        setError("Invalid test ID.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      setQuestions([])
      setNextPagePath(null)
      nextPagePathRef.current = null

      try {
        const page = await fetchQuestionsPage(parsedTestId)
        if (page.questions.length === 0) {
          setError("No questions found for this test.")
          setQuestions([])
        } else {
          setQuestions(page.questions)
          setTotalQuestionCount(page.totalCount)
          setNextPagePath(page.nextPath)
          nextPagePathRef.current = page.nextPath
        }
      } catch (err) {
        console.error("[assessment] Failed to load questions/options:", err)
        setError("Unable to load assessment right now.")
        setQuestions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadInitial()
  }, [parsedTestId])

  useEffect(() => {
    const duration = Math.max(
      60,
      (Number.isFinite(configuredDurationMinutes) ? configuredDurationMinutes : 30) * 60,
    )
    setTimeLeft(duration)
  }, [configuredDurationMinutes, parsedTestId])

  useEffect(() => {
    if (isLoading || isSubmitting || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [isLoading, isSubmitting, timeLeft])

  useEffect(() => {
    if (isLoading) return
    const shouldPrefetch =
      currentQuestionIndex >= questions.length - PREFETCH_THRESHOLD - 1 &&
      Boolean(nextPagePathRef.current)
    if (shouldPrefetch) {
      void loadMoreQuestions()
    }
  }, [currentQuestionIndex, questions.length, isLoading, loadMoreQuestions])

  useEffect(() => {
    if (isLoading) return
    if (currentQuestionIndex < questions.length) return
    void ensureQuestionsUpTo(currentQuestionIndex)
  }, [currentQuestionIndex, questions.length, isLoading, ensureQuestionsUpTo])

  const totalQuestions = totalQuestionCount || questions.length
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = totalQuestions > 0 && currentQuestionIndex >= totalQuestions - 1
  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  )
  const progress = totalQuestions === 0 ? 0 : ((currentQuestionIndex + 1) / totalQuestions) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, "0")}`
  }

  const navigateToQuestion = async (index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalQuestions - 1, index))
    if (clampedIndex >= questions.length) {
      await ensureQuestionsUpTo(clampedIndex)
    }
    setCurrentQuestionIndex(clampedIndex)
  }

  const handleSelectAnswer = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
    if (!isLastQuestion) {
      void navigateToQuestion(currentQuestionIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (!assessmentId) {
      setError("Assessment ID is required.")
      return
    }

    const answeredIds = Object.keys(answers).map(Number)
    if (answeredIds.length === 0) {
      setError("Please answer at least one question before submitting.")
      return
    }

    const payload = {
      assessment_id: assessmentId,
      question_ids: answeredIds,
      selected_option_ids: answeredIds.map((id) => answers[id]),
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await apiClient.post("/api/external/assessment/assessment_status/create", payload)
      router.push("/dashboard?view=assessments")
    } catch (err) {
      console.error("[assessment] submit error:", err)
      setError("Failed to submit assessment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="border border-border p-8">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="font-semibold text-foreground">Loading questions...</p>
        </Card>
      </div>
    )
  }

  if (error && questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-sm border border-border p-8">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
          <p className="text-center font-semibold text-foreground">{error}</p>
          <Button onClick={() => router.push("/dashboard?view=assessments")} className="mt-4 w-full">
            Back to Assessments
          </Button>
        </Card>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="border border-border p-8">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="font-semibold text-foreground">
            {isLoadingMore ? "Loading next questions..." : "Preparing question..."}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-6">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Assessment</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Answered {answeredCount}/{totalQuestions}
              </span>
              {isLoadingMore && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Syncing
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium ${
                  timeLeft <= 60 ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"
                }`}
              >
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Card className="border border-border p-6 md:p-8">
          <Badge className="mb-4 border-0 bg-primary/10 text-primary">
            Question {currentQuestionIndex + 1}
          </Badge>
          <h2 className="mb-6 text-lg font-semibold leading-relaxed text-foreground">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(currentQuestion.id, option.id)}
                  disabled={isSubmitting}
                  className={`w-full rounded-lg border-2 p-4 text-left transition ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-input bg-background hover:border-primary/50"
                  } ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-5 w-5 rounded-full border-2 ${
                        selected ? "border-primary bg-primary" : "border-input"
                      }`}
                    />
                    <p className="text-sm font-medium text-foreground md:text-base">{option.option}</p>
                  </div>
                </button>
              )
            })}
            {currentQuestion.options.length === 0 && (
              <p className="rounded-lg border border-input bg-muted/30 p-4 text-sm text-muted-foreground">
                No options found for this question.
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-input pt-6">
            <Button
              variant="outline"
              onClick={() => void navigateToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard?view=assessments")}
                disabled={isSubmitting}
              >
                Quit
              </Button>
              {isLastQuestion ? (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Assessment"}
                </Button>
              ) : (
                <Button
                  onClick={() => void navigateToQuestion(currentQuestionIndex + 1)}
                  disabled={isSubmitting || (currentQuestionIndex + 1 >= questions.length && !nextPagePath && !isLoadingMore)}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">QUESTION MAP</p>
          <div className="grid grid-cols-10 gap-2 md:grid-cols-15">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const isCurrent = index === currentQuestionIndex
              const loadedQuestion = questions[index]
              const isAnswered = loadedQuestion ? answers[loadedQuestion.id] !== undefined : false
              const isLoaded = index < questions.length

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => void navigateToQuestion(index)}
                  disabled={!isLoaded && !nextPagePath && index >= questions.length}
                  className={`h-8 w-8 rounded text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isAnswered
                        ? "border border-green-300 bg-green-100 text-green-700"
                        : isLoaded
                          ? "border border-input bg-muted text-muted-foreground hover:border-primary"
                          : "border border-dashed border-input/70 bg-muted/40 text-muted-foreground/60"
                  }`}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
