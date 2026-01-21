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
}

interface Question {
  id: number
  question: string
  options: Option[]
}

interface QuestionResponse {
  status: string
  data: Question[]
}

export default function AssessmentPage() {
  const params = useParams()
  const router = useRouter()

  const [testId, setTestId] = useState<number | null>(null)
  
  // Handle params unwrapping and basic validation
  useEffect(() => {
    if (params?.testId) {
      const rawId = Array.isArray(params.testId) ? params.testId[0] : params.testId
      console.log("[v0] Raw testId from params:", rawId)
      
      const parsed = parseInt(rawId, 10)
      if (!isNaN(parsed) && parsed > 0) {
        console.log("[v0] Parsed valid testId:", parsed)
        
        // Access Control Check
        try {
          const paidTestsStr = localStorage.getItem("paidTests")
          if (paidTestsStr) {
            const paidTests = JSON.parse(paidTestsStr)
            const isAllowed = paidTests.some((t: any) => t.id === parsed)
            
            if (!isAllowed) {
              console.warn("[v0] Access denied: Test ID not found in paid tests")
              setError("Access Denied: You have not purchased this test.")
              setIsLoading(false)
              return 
            }
          } else {
             console.warn("[v0] No paid tests found in storage")
             // In dev mode or if explicitly testing, might want to bypass, but for security:
             setError("Access Denied: No active assessments found.")
             setIsLoading(false)
             return
          }
        } catch (authErr) {
          console.error("[v0] Error checking access permissions:", authErr)
          // Fail safe
          setError("Error verifying access permissions.")
          setIsLoading(false)
          return
        }

        setTestId(parsed)
      } else {
        console.error("[v0] Invalid testId parsed:", parsed)
        setError("Invalid test ID format")
        setIsLoading(false)
      }
    }
  }, [params])

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // Stores option_no now
  const [selectedTests, setSelectedTests] = useState<number[]>([]) // Track selected tests    

  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [isLoading, setIsLoading] = useState(true)
  const [showWarning, setShowWarning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testName, setTestName] = useState<string>("")

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

        if (response.data?.status === "success" && response.data?.data) {
          if (response.data.data.length === 0) {
             console.warn("[v0] API returned success but empty data array")
             setError("No questions found for this test.")
          } else {
             setQuestions(response.data.data)
             setError(null)
          }

          // Try to find test name from local storage
          try {
            const paidTests = localStorage.getItem("paidTests")
            if (paidTests) {
              const tests = JSON.parse(paidTests)
              const currentTest = tests.find((t: any) => t.id === testId)
              if (currentTest) {
                setTestName(currentTest.evaluation_name)
              }
            }
          } catch (storageErr) {
            console.warn("[v0] Error reading from localStorage:", storageErr)
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
          <Button onClick={() => router.push("/assessments")} className="mt-4 w-full">
            Return to Assessments
          </Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const testProgress = ((currentQuestionIndex + 1) / questions.length) * 100
  const selectedAnswer = answers[currentQuestion.id] // This is now option_no

  const handleSelectAnswer = (option_no: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option_no,
    }))
    // Only add to selectedTests if not already there to avoid duplicates? 
    // User logic was append: setSelectedTests((prev) => [...prev, currentQuestion.id])
    if (!selectedTests.includes(currentQuestion.id)) {
        setSelectedTests((prev) => [...prev, currentQuestion.id])
    }
    
    // Auto advance after short delay or immediately? User had immediate next.
    // setCurrentQuestionIndex((prev) => prev + 1) // User logic
    
    // Let's keep user logic but maybe check bounds
    if (currentQuestionIndex < questions.length - 1) {
         setCurrentQuestionIndex((prev) => prev + 1)
    }

    console.log("Selected Tests:", selectedTests)
    console.log("Answers:", answers)
    console.log("Current Question Index:", currentQuestionIndex)
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = () => {
    router.push("/assessments")
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
                Question {currentQuestionIndex + 1} of {questions.length}
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
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option.option_no
                    ? "border-primary bg-primary/5"
                    : "border-input bg-background hover:border-primary/50 hover:bg-muted/30"
                }`}
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
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
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
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded text-xs font-semibold transition-all ${
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[currentQuestion.id] !== undefined
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
