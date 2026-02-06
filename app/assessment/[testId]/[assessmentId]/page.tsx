"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"
import axios from "axios"

interface Option {
  id: number
  option: string
  option_no: number
  weightage: number
  question: number
}

interface Question {
  id: number
  question: string
  options: Option[]
}

interface QuestionResponse {
  count: number
  next: string | null
  previous: string | null
  results: {
    status: string
    data: Question[]
  }
}

export default function AssessmentPage() {
  const params = useParams()
  const router = useRouter()

  const [testId, setTestId] = useState<number | null>(null)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  
  // Handle params unwrapping and basic validation
  useEffect(() => {
    if (params) {
      // Handle testId
      const rawTestId = Array.isArray(params.testId) ? params.testId[0] : params.testId
      const parsedTestId = parseInt(rawTestId as string, 10)
      
      // Handle assessmentId
      const rawAssessmentId = Array.isArray(params.assessmentId) ? params.assessmentId[0] : params.assessmentId
      
      console.log("[v0] Params:", { testId: rawTestId, assessmentId: rawAssessmentId })

      if (!isNaN(parsedTestId) && parsedTestId > 0) {
        setTestId(parsedTestId)
      } else {
        console.error("[v0] Invalid testId parsed:", parsedTestId)
        setError("Invalid test ID format")
        setIsLoading(false)
        return
      }

      if (rawAssessmentId) {
        setAssessmentId(rawAssessmentId as string)
      } else {
        console.warn("[v0] No assessmentId found in params")
      }
    }
  }, [params])

  const [questions, setQuestions] = useState<Question[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // Stores option_no now  

  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testName, setTestName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    const fetchQuestions = async () => {
      if (testId === null) return // Wait for testId to be set

      try {
        console.log("[v0] Starting fetch for test ID:", testId)
        // Note: Using the proxy configured in next.config.mjs to avoid Mixed Content errors
        const apiUrl = `/api/external/question-options/${testId}?page=1`
        console.log("[v0] API URL:", apiUrl)

        const response = await axios.get<QuestionResponse>(
          apiUrl,
          { timeout: 30000 },
        )

        console.log("[v0] Questions response status:", response.status)
        console.log("[v0] Questions response data:", response.data)

        if (response.data?.results?.status === "success" && response.data?.results?.data) {
          if (response.data.results.data.length === 0) {
             console.warn("[v0] API returned success but empty data array")
             setError("No questions found for this test.")
          } else {
             setQuestions(response.data.results.data)
             setTotalCount(response.data.count)
             setNextPageUrl(response.data.next)
             setError(null)
          }

          // Try to find test name from local storage - keeping for now as fallback/legacy
          // In future this should probably come from an API using assessmentId
          try {
             // We can maybe fetch assessment details here using assessmentId if needed
          } catch (err) {
            console.warn("[v0] Error setting test details", err)
          }

        } else {
          console.error("[v0] API response not successful:", response.data)
          setError("Failed to load questions (API Error)")
        }
      } catch (err) {
        console.error("[v0] Error fetching questions:", err)
        if (axios.isAxiosError(err)) {
           console.error("[v0] Axios error details:", {
             message: err.message,
             code: err.code,
             response: err.response?.data
           })
           setError(`Network error: ${err.message}`)
        } else {
           setError("An unexpected error occurred.")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [testId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isLoading || questions.length === 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 60 && !showWarning) {
          setShowWarning(true)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isLoading, showWarning, questions.length])

  // Debug: Log answers whenever they change
  useEffect(() => {
    console.log("Updated Answers:", answers)
  }, [answers])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 border border-border">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4 mx-auto" />
          <p className="text-foreground font-semibold">Loading questions...</p>
        </Card>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 border border-border max-w-sm mx-4">
          <AlertCircle className="w-8 h-8 text-red-500 mb-4 mx-auto" />
          <p className="text-foreground font-semibold text-center">{error || "No questions found"}</p>
          <Button onClick={() => router.push("/dashboard?view=assessments")} className="mt-4 w-full">
            Return to Assessments
          </Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const displayTotal = totalCount || questions.length
  const testProgress = ((currentQuestionIndex + 1) / displayTotal) * 100
  const selectedAnswer = answers[currentQuestion.id] // This is now option_no

  const handleSelectAnswer = (option_no: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option_no,
    }))
    
    // Auto advance handling
    // We delegate completely to handleNext() which handles both local navigation
    // and fetching the next page from the API when at the end of the list.
    handleNext()
  }

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (nextPageUrl) {
      // Fetch next page
      setIsFetchingMore(true)
      try {
        // Construct proxy URL from next URL
        // Expected format: http://.../api/question-options/29?page=2
        // We want: /api/external/question-options/${testId}?page=2
        const urlObj = new URL(nextPageUrl)
        const pageParam = urlObj.searchParams.get("page")
        
        if (pageParam && testId) {
           const proxyUrl = `/api/external/question-options/${testId}?page=${pageParam}`
           console.log("[v0] Fetching next page:", proxyUrl)
           
           const response = await axios.get<QuestionResponse>(proxyUrl)
           if (response.data?.results?.data) {
             setQuestions(prev => [...prev, ...response.data.results.data])
             setNextPageUrl(response.data.next)
             setCurrentQuestionIndex(prev => prev + 1)
           }
        } else {
          console.error("Could not parse page param from next url:", nextPageUrl)
        }
      } catch (err) {
        console.error("Error fetching more questions:", err)
      } finally {
        setIsFetchingMore(false)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    if (!assessmentId) {
      setError("Assessment ID needed to submit.")
      return
    }

    setIsSubmitting(true)
    try {
      const questionIds: number[] = []
      const selectedOptionIds: number[] = []

      questions.forEach(q => {
        const answerOptionNo = answers[q.id]
        if (answerOptionNo !== undefined) {
          const selectedOption = q.options.find(o => o.option_no === answerOptionNo)
          if (selectedOption) {
            questionIds.push(q.id)
            selectedOptionIds.push(selectedOption.id)
          }
        }
      })

      const payload = {
        assessment_id: assessmentId,
        question_ids: questionIds,
        selected_option_ids: selectedOptionIds
      }

      console.log("Submitting assessment payload:", payload)

      const response = await axios.post("/api/external/assessment-status/create/", payload)

      if (response.status === 200 || response.status === 201) {
         console.log("Submission successful:", response.data)
         router.push("/dashboard?view=assessments")
      } else {
        console.error("Submission failed with status:", response.status)
        setError("Failed to submit assessment. Please try again.")
      }

    } catch (err) {
      console.error("Error submitting assessment:", err)
      if (axios.isAxiosError(err)) {
         setError(`Submission error: ${err.message}`)
      } else {
         setError("An unexpected error occurred during submission.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuit = () => {
    router.push("/dashboard?view=assessments")
  }

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
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Test {testName}</h1>
              {/* <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p> */}
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
                Question {currentQuestionIndex + 1} of {displayTotal}
              </span>
              <span className="text-xs md:text-sm font-medium text-muted-foreground">
                Overall Progress: {Math.round(testProgress)}%
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
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.option_no)}
                disabled={isFetchingMore || isSubmitting}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option.option_no
                    ? "border-primary bg-primary/5"
                    : "border-input bg-background hover:border-primary/50 hover:bg-muted/30"
                } ${isFetchingMore || isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === option.option_no ? "border-primary bg-primary" : "border-input"
                    }`}
                  >
                    {selectedAnswer === option.option_no && (
                      <span className="text-primary-foreground text-sm font-bold">✓</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-foreground font-medium">{option.option}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-input">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isFetchingMore || isSubmitting}
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

           <div className="flex items-center gap-2">
             <Button onClick={handleQuit} className="gap-2 bg-red-600 hover:bg-red-700">
                Quit
            </Button>

            {!nextPageUrl && currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 gap-2">
                {isSubmitting ? (
                  <>
                     <Loader2 className="w-4 h-4 animate-spin" />
                     Submitting...
                  </>
                ) : (
                  "Submit Assessment"
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isFetchingMore} className="gap-2">
                {isFetchingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
           </div>
          </div>
        </Card>

         {/* Question Indicators */}
        <div className="mt-8">
          <p className="text-xs text-muted-foreground mb-3 font-semibold">QUESTION MAP</p>
          <div className="grid grid-cols-10 md:grid-cols-15 gap-2">
            {Array.from({ length: displayTotal }).map((_, index) => {
              const isLoaded = index < questions.length
              const question = isLoaded ? questions[index] : null
              const isAnswered = question ? answers[question.id] !== undefined : false
              
              return (
              <button
                key={index}
                onClick={() => isLoaded && setCurrentQuestionIndex(index)}
                disabled={!isLoaded || isFetchingMore || isSubmitting}
                className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : isAnswered
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : !isLoaded 
                        ? "bg-muted/50 text-muted-foreground/50 border border-input cursor-not-allowed"
                        : "bg-muted text-muted-foreground border border-input hover:border-primary"
                }`}
              >
                {index + 1}
              </button>
            )})}
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
