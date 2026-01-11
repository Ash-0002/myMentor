"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react"

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: number
}

interface TestAssessment {
  testId: number
  testName: string
  totalQuestions: number
  duration: number // in minutes
  questions: Question[]
}

// Mock assessment data - in production this would come from an API
const assessmentData: Record<number, TestAssessment> = {
  1: {
    testId: 1,
    testName: "MDPS - Mclassod Development Progress System",
    totalQuestions: 30,
    duration: 30,
    questions: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}: What is the primary characteristic being assessed?`,
      options: [
        `Option A for question ${i + 1}`,
        `Option B for question ${i + 1}`,
        `Option C for question ${i + 1}`,
        `Option D for question ${i + 1}`,
        `Option E for question ${i + 1}`,
      ],
      correct_answer: Math.floor(Math.random() * 5),
    })),
  },
  2: {
    testId: 2,
    testName: "ISSA - Indian Scale For Autism Assessment",
    totalQuestions: 35,
    duration: 30,
    questions: Array.from({ length: 35 }, (_, i) => ({
      id: i + 1,
      question: `Assessment Question ${i + 1}: Evaluate the behavioral indicator`,
      options: ["Never observed", "Rarely observed", "Sometimes observed", "Often observed", "Always observed"],
      correct_answer: Math.floor(Math.random() * 5),
    })),
  },
  3: {
    testId: 3,
    testName: "SCARED - Screen for Child Anxiety Related Disorders",
    totalQuestions: 41,
    duration: 30,
    questions: Array.from({ length: 41 }, (_, i) => ({
      id: i + 1,
      question: `Anxiety Question ${i + 1}: Does the child exhibit this behavior?`,
      options: ["Not at all", "Somewhat", "Fairly often", "Very often"],
      correct_answer: Math.floor(Math.random() * 4),
    })),
  },
}

export default function AssessmentPage() {
  const router = useRouter()
  const [selectedTests, setSelectedTests] = useState<number[]>([])
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Record<number, number>>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)

  // Load selected tests from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("assessmentTestIds")
    if (stored) {
      try {
        const tests = JSON.parse(stored)
        setSelectedTests(tests)
        // Initialize answers object
        const answersObj: Record<number, Record<number, number>> = {}
        tests.forEach((testId: number) => {
          answersObj[testId] = {}
        })
        setAnswers(answersObj)
        // Set initial timer
        const firstTest = assessmentData[tests[0]]
        setTimeLeft(firstTest?.duration * 60 || 1800)
        setIsLoading(false)
      } catch (error) {
        console.log("[v0] Error loading tests", error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isLoading) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 60 && !showWarning) {
          setShowWarning(true)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isLoading, showWarning])

  if (isLoading || selectedTests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 border border-border">
          <AlertCircle className="w-8 h-8 text-yellow-500 mb-4" />
          <p className="text-foreground font-semibold">No tests selected</p>
          <p className="text-sm text-muted-foreground mt-2">Please complete payment first</p>
          <Button onClick={() => router.push("/")} className="mt-4 w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const currentTest = assessmentData[selectedTests[currentTestIndex]]
  if (!currentTest) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 border border-border">
          <p className="text-foreground font-semibold">Assessment not found</p>
          <Button onClick={() => router.push("/")} className="mt-4 w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = currentTest.questions[currentQuestionIndex]
  const testProgress = ((currentQuestionIndex + 1) / currentTest.totalQuestions) * 100
  const overallProgress = ((currentTestIndex * 100 + testProgress) / (selectedTests.length * 100)) * 100

  const selectedAnswer = answers[selectedTests[currentTestIndex]]?.[currentQuestionIndex]

  const handleSelectAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [selectedTests[currentTestIndex]]: {
        ...prev[selectedTests[currentTestIndex]],
        [currentQuestionIndex]: optionIndex,
      },
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < currentTest.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentTestIndex < selectedTests.length - 1) {
      const nextTestId = selectedTests[currentTestIndex + 1]
      const nextTest = assessmentData[nextTestId]
      setCurrentTestIndex(currentTestIndex + 1)
      setCurrentQuestionIndex(0)
      setTimeLeft(nextTest?.duration * 60 || 1800)
      setShowWarning(false)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentTestIndex > 0) {
      setCurrentTestIndex(currentTestIndex - 1)
      const prevTest = assessmentData[selectedTests[currentTestIndex - 1]]
      setCurrentQuestionIndex(prevTest?.totalQuestions - 1 || 0)
    }
  }

  const handleSubmit = () => {
    const testResults = {
      testId: selectedTests[currentTestIndex],
      testName: currentTest.testName,
      totalQuestions: currentTest.totalQuestions,
      answers: answers[selectedTests[currentTestIndex]],
      submittedAt: new Date().toISOString(),
      duration: currentTest.duration,
    }

    // Calculate score
    const correctAnswers = Object.entries(answers[selectedTests[currentTestIndex]] || {}).reduce(
      (count, [questionIndex, selectedOptionIndex]) => {
        const question = currentTest.questions[Number.parseInt(questionIndex)]
        return selectedOptionIndex === question.correct_answer ? count + 1 : count
      },
      0,
    )

    const scorePercentage = Math.round((correctAnswers / currentTest.totalQuestions) * 100)

    const resultData = {
      ...testResults,
      correctAnswers,
      scorePercentage,
    }

    // Store in localStorage
    const existingResults = localStorage.getItem("assessmentResults")
    const results = existingResults ? JSON.parse(existingResults) : []
    results.push(resultData)
    localStorage.setItem("assessmentResults", JSON.stringify(results))

    // Update paid tests status to completed
    const paidTests = JSON.parse(localStorage.getItem("paidTests") || "[]")
    const updatedTests = paidTests.map((test: any) =>
      test.id === selectedTests[currentTestIndex] ? { ...test, status: "completed" } : test,
    )
    localStorage.setItem("paidTests", JSON.stringify(updatedTests))

    // Navigate to results page
    router.push(`/assessment-results/${selectedTests[currentTestIndex]}`)
  }

  const isLastQuestion =
    currentQuestionIndex === currentTest.totalQuestions - 1 && currentTestIndex === selectedTests.length - 1

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{currentTest.testName}</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Test {currentTestIndex + 1} of {selectedTests.length}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft <= 60 ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm md:text-base">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1} of {currentTest.totalQuestions}
              </span>
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Overall Progress: {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={testProgress} className="h-2" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <Card className="p-6 md:p-8 border border-border bg-card shadow-lg">
          {/* Question */}
          <div className="mb-8">
            <Badge className="mb-4 bg-primary/10 text-primary border-0">Question {currentQuestionIndex + 1}</Badge>
            <h2 className="text-lg md:text-xl font-semibold text-foreground leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? "border-primary bg-primary/5"
                    : "border-input bg-background hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === index ? "border-primary bg-primary" : "border-input"
                    }`}
                  >
                    {selectedAnswer === index && <span className="text-primary-foreground text-sm font-bold">✓</span>}
                  </div>
                  <span className="text-sm md:text-base text-foreground font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-input">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 && currentTestIndex === 0}
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {isLastQuestion ? (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 gap-2">
                Submit Assessment
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Question Indicators */}
        <div className="mt-8">
          <p className="text-xs text-muted-foreground mb-3 font-semibold">QUESTION MAP</p>
          <div className="grid grid-cols-10 md:grid-cols-15 gap-2">
            {currentTest.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[selectedTests[currentTestIndex]]?.[index] !== undefined
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-muted text-muted-foreground border border-input hover:border-primary"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 border border-border max-w-sm mx-4">
            <AlertCircle className="w-6 h-6 text-orange-500 mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Time Running Out</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have less than 1 minute remaining for this assessment.
            </p>
            <Button onClick={() => setShowWarning(false)} className="w-full">
              Continue
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
