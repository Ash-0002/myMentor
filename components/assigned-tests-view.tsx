"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, ArrowRight, Loader2 } from "lucide-react"
import axios from "axios"

interface Test {
  id: number
  evaluation_code: string
  evaluation_name: string
  evaluation_fullname: string
  evaluation_cost: number
  evaluation_time: number
}

interface PaidTest extends Test {
  status: "pending" | "in_progress" | "completed"
  progressPercentage: number
  totalQuestions: number
  paymentDate: string
}

interface QuestionResponse {
  status: string
  data: Array<{
    id: number
    question: string
    options: Array<{
      id: number
      option_text: string
      weightage: number
    }>
  }>
}

const fetchTestQuestionCount = async (testId: number): Promise<number> => {
  try {
    const response = await axios.get<QuestionResponse>(
      `http://31.97.63.174:9010/api/question-options/${testId}?page=1`,
      { timeout: 10000 },
    )

    if (response.data?.status === "success" && response.data?.data) {
      return response.data.data.length
    }
    return 0
  } catch (error) {
    console.log("[v0] Error fetching question count for test ${testId}:", error)
    return 0
  }
}

const getPaidTests = async (): Promise<PaidTest[]> => {
  const storedTests = localStorage.getItem("paidTests")
  const paymentStatus = localStorage.getItem("paymentStatus")

  if (paymentStatus === "completed" && storedTests) {
    try {
      const tests: Test[] = JSON.parse(storedTests)

      const testsWithQuestionCounts = await Promise.all(
        tests.map(async (test) => {
          const questionCount = await fetchTestQuestionCount(test.id)
          return {
            ...test,
            status: "pending" as const,
            progressPercentage: 0,
            totalQuestions: questionCount,
            paymentDate: new Date().toISOString(),
          }
        }),
      )

      return testsWithQuestionCounts
    } catch (error) {
      console.log("[v0] Error loading paid tests", error)
      return []
    }
  }
  return []
}

interface AssignedTestsViewProps {
  onStartAssessment?: () => void
}

export default function AssignedTestsView({ onStartAssessment }: AssignedTestsViewProps) {
  const router = useRouter()
  const [paidTests, setPaidTests] = useState<PaidTest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTests = async () => {
      setIsLoading(true)
      const tests = await getPaidTests()
      setPaidTests(tests)
      setIsLoading(false)
    }
    loadTests()
  }, [])

  const startAssessment = (testId: number) => {
    localStorage.setItem("currentTestId", String(testId))
    router.push(`/assessment/${testId}`)
  }

  const getStatusColor = (status: PaidTest["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "in_progress":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-yellow-100 text-yellow-700"
    }
  }

  const getStatusIcon = (status: PaidTest["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5" />
      case "in_progress":
        return <Clock className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  if (isLoading) {
    return (
      <Card className="p-8 border border-border">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <p className="text-foreground font-medium">Loading assessments...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Assessments</h2>
        <p className="text-muted-foreground">
          You have {paidTests.filter((t) => t.status === "pending").length} assessment(s) waiting to be completed
        </p>
      </div>

      {paidTests.length === 0 ? (
        <Card className="p-12 border border-border text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Assessments Yet</h2>
          <p className="text-muted-foreground mb-6">Complete a payment to access your assigned assessments</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paidTests.map((test) => (
            <Card
              key={test.id}
              className={`p-6 border transition-all hover:shadow-lg ${
                test.status === "pending"
                  ? "border-border hover:border-primary cursor-pointer"
                  : "border-border opacity-75"
              }`}
            >
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground leading-tight pr-2">{test.evaluation_name}</h3>
                  <Badge className={`${getStatusColor(test.status)} border-0 ml-2 flex-shrink-0 gap-1`}>
                    {getStatusIcon(test.status)}
                    <span className="capitalize text-xs">{test.status}</span>
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-input">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-semibold text-foreground">{test.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold text-foreground">{test.evaluation_time} minutes</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold text-foreground">₹{test.evaluation_cost.toLocaleString()}</span>
                </div>
              </div>

              {test.status === "completed" ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  <Button disabled className="w-full mt-4 opacity-50">
                    Completed
                  </Button>
                </div>
              ) : test.status === "in_progress" ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-blue-600">{test.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${test.progressPercentage}%` }}
                    ></div>
                  </div>
                  <Button onClick={() => startAssessment(test.id)} className="w-full mt-4 gap-2">
                    Continue Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => startAssessment(test.id)}
                  className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                  Start Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
