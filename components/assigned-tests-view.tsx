"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, ChevronRight, PlayCircle, FileText, Loader2, ArrowRight } from "lucide-react"
import axios from "axios"

interface Assessment {
  patient_id: string
  assessment_id: string
  assessment_status: string
  test_name: string
  test_duration: number
  amount_paid: number
  total_questions: number
  test_id: number
}

interface PaidTest {
  assessment_id: string
  evaluation_name: string
  evaluation_cost: number
  evaluation_time: number
  totalQuestions: number
  status: string
  progressPercentage: number
  paymentDate?: string
  test_id: number
}

const fetchAssignedTests = async (): Promise<PaidTest[]> => {
  try {
    const response = await axios.get<{ message: string; data: Assessment[] }>(
      "/api/external/patient/assessments?patient_id=5",
    )

    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data.map((assessment) => ({
        assessment_id: assessment.assessment_id,
        evaluation_name: assessment.test_name,
        evaluation_cost: assessment.amount_paid,
        evaluation_time: assessment.test_duration,
        totalQuestions: assessment.total_questions,
        status: assessment.assessment_status,
        progressPercentage: 0,
        test_id: assessment.test_id,
        paymentDate: new Date().toISOString(), // Fallback
      }))
    }
    return []
  } catch (error) {
    console.error("[v0] Error fetching assigned tests:", error)
    return []
  }
}

interface AssignedTestsViewProps {
  onStartAssessment?: () => void
}

export default function AssignedTestsView({ onStartAssessment }: AssignedTestsViewProps) {
  const router = useRouter()
  const [paidTests, setPaidTests] = useState<PaidTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null)

  useEffect(() => {
    const loadTests = async () => {
      setIsLoading(true)
      const tests = await fetchAssignedTests()
      setPaidTests(tests)
      setIsLoading(false)
    }
    loadTests()
  }, [])

  const handleStartAssessment = (testId: number, assessmentId: string) => {
    router.push(`/assessment/${testId}/${assessmentId}`)
  }

  const handleViewReport = async (assessmentId: string) => {
    setDownloadingReportId(assessmentId)
    try {
      const response = await axios.post(
        "/api/external/assessment-report/create/",
        { assessment_id: assessmentId },
        // { responseType: "blob" }
      )
      
      const url = response.data.report_url;
      window.open(url, '_blank')
    } catch (error) {
      console.error("Error downloading report:", error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setDownloadingReportId(null)
    }
  }

  const getStatusColor = (status: PaidTest["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
        default:
          return "bg-blue-100 text-blue-700"
    }
  }

  const getStatusIcon = (status: PaidTest["status"]) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-5 h-5" />
      case "Pending":
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
      {/* <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="-ml-2">
            <ArrowLeft className="w-6 h-6" />
        </Button>
      </div> */}
      <div>
        <h2 className="tenxt-2xl md:text-3xl font-bold text-foreground mb-2">My Assessments</h2>
        <p className="text-muted-foreground">
          You have {paidTests.filter((t) => t.status === "Pending" || t.status === "In Progress").length} assessment(s) waiting to be completed
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
              key={test.assessment_id}
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

              {test.status === "Completed" ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-4 gap-2"
                    onClick={() => handleViewReport(test.assessment_id)}
                    disabled={downloadingReportId === test.assessment_id}
                  >
                    {downloadingReportId === test.assessment_id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        View Report
                      </>
                    )}
                  </Button>
                </div>
              ) : test.status === "Pending" ? (
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
                  <Button onClick={() => handleStartAssessment(test.test_id,test.assessment_id)} className="w-full mt-4 gap-2">
                    Continue Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => handleStartAssessment(test.test_id,test.assessment_id)}
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
