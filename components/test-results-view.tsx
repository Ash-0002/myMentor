"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Award, Eye, Download, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

interface TestResult {
  testId: number
  testName: string
  scorePercentage: number
  correctAnswers: number
  totalQuestions: number
  submittedAt: string
  status: "passed" | "failed"
}

const getTestResults = async (): Promise<TestResult[]> => {
  // TODO: Replace with API call
  // const response = await fetch('/api/assessments/results')
  // return response.json()

  try {
    const storedResults = localStorage.getItem("assessmentResults")
    if (storedResults) {
      const parsed = JSON.parse(storedResults)
      return parsed.map((r: any) => ({
        ...r,
        status: r.scorePercentage >= 60 ? "passed" : "failed",
      }))
    }
  } catch (error) {
    console.log("[v0] Error loading results:", error)
  }
  return []
}

export default function TestResultsView() {
  const router = useRouter()
  const [results, setResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true)
      const data = await getTestResults()
      setResults(data)
      setIsLoading(false)
    }
    loadResults()
  }, [])

  const passedCount = results.filter((r) => r.status === "passed").length
  const totalTests = results.length
  const averageScore =
    totalTests > 0 ? Math.round(results.reduce((sum, r) => sum + r.scorePercentage, 0) / totalTests) : 0

  const viewDetails = (testId: number) => {
    router.push(`/assessment-results/${testId}`)
  }

  if (isLoading) {
    return (
      <Card className="p-8 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Award className="w-8 h-8 text-primary" />
          Test Results
        </h2>
        <p className="text-muted-foreground">View your assessment results and performance summary</p>
      </div>

      {results.length === 0 ? (
        <Card className="p-12 border border-border text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Results Yet</h2>
          <p className="text-muted-foreground">Complete an assessment to see your results here</p>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Tests Completed</p>
                  <p className="text-3xl font-bold text-foreground">{totalTests}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Tests Passed</p>
                  <p className="text-3xl font-bold text-green-600">{passedCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-primary">{averageScore}%</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{averageScore}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Your Results</h3>
            {results.map((result) => (
              <Card key={result.testId} className="p-6 border border-border hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg leading-tight">{result.testName}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(result.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge
                        className={
                          result.status === "passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }
                      >
                        {result.status === "passed" ? "✓ Passed" : "✗ Failed"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Score</p>
                        <p className="text-2xl font-bold text-primary">{result.scorePercentage}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Correct Answers</p>
                        <p className="text-2xl font-bold text-green-600">
                          {result.correctAnswers}/{result.totalQuestions}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Accuracy</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => viewDetails(result.testId)} variant="outline" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button onClick={() => window.print()} variant="ghost" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
