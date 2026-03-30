"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Award, Calendar, Loader2, PieChartIcon, TrendingUp } from "lucide-react"
import axios from "axios"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { isIndividualDashboardUser, normalizeDashboardUser } from "@/lib/dashboard-user"

interface Assessment {
  assessment_id: string
  assessment_status: string
  test_name: string
  test_duration: number
  amount_paid: number
  total_questions: number
}

interface AssessmentReportChartData {
  sub_category: string
  sub_category_score: number
  sub_category_descriptor?: Array<{
    test_descriptor_id: number
    test_descriptor: string
  }>
}

interface AssessmentReport {
  patient_data: {
    patient_id: string
    first_name: string
    last_name: string
    username: string
    role: number
  }
  test_name: string
  overall_score: number
  interpretation?: {
    advice?: string
    result?: string
    symptoms?: {
      mental?: string
      physical?: string
      conditions_linked?: string
    }
  }
  test_charts?: string
  test_chart_data?: AssessmentReportChartData[]
}

const CHART_COLORS = ["#2563eb", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e"]

function getPatientIdFromStorage(): string | null {
  try {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return null
    const normalized = normalizeDashboardUser(JSON.parse(storedUser))
    if (!normalized || !isIndividualDashboardUser(normalized)) return null
    return normalized.patient_id
  } catch {
    return null
  }
}

async function fetchCompletedAssessments(patientId: string): Promise<Assessment[]> {
  const response = await axios.get<{ data?: Assessment[] }>(
    `/api/external/patient/assessments?patient_id=${encodeURIComponent(patientId)}`,
  )
  const rows = Array.isArray(response.data?.data) ? response.data.data : []
  return rows.filter((item) => (item.assessment_status || "").toLowerCase() === "completed")
}

export default function TestResultsView() {
  const [completedAssessments, setCompletedAssessments] = useState<Assessment[]>([])
  const [reportsByAssessmentId, setReportsByAssessmentId] = useState<Record<string, AssessmentReport>>({})
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssessments = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const patientId = getPatientIdFromStorage()
        if (!patientId) {
          setError("Unable to find patient session. Please login again.")
          setCompletedAssessments([])
          return
        }
        const assessments = await fetchCompletedAssessments(patientId)
        setCompletedAssessments(assessments)
      } catch (err) {
        console.error("[v0] Error loading completed assessments:", err)
        setError("Unable to load completed assessments right now.")
      } finally {
        setIsLoading(false)
      }
    }
    loadAssessments()
  }, [])

  const totalTests = completedAssessments.length
  const reportsGeneratedCount = Object.keys(reportsByAssessmentId).length
  const averageOverallScore =
    reportsGeneratedCount > 0
      ? Number(
          (
            Object.values(reportsByAssessmentId).reduce((sum, report) => sum + Number(report.overall_score || 0), 0) /
            reportsGeneratedCount
          ).toFixed(2),
        )
      : 0

  const generateAndShowReport = async (assessmentId: string) => {
    const cached = reportsByAssessmentId[assessmentId]
    if (cached) {
      setSelectedAssessmentId(assessmentId)
      return
    }

    setLoadingReportId(assessmentId)
    try {
      const response = await axios.post<{ data?: AssessmentReport; message?: string }>(
        "/api/external/assessment-report/create",
        { assessment_id: assessmentId },
      )
      const reportData = response.data?.data
      if (!reportData) {
        throw new Error(response.data?.message || "Invalid report response")
      }

      setReportsByAssessmentId((prev) => ({ ...prev, [assessmentId]: reportData }))
      setSelectedAssessmentId(assessmentId)
    } catch (err) {
      console.error("[v0] Failed to generate assessment report:", err)
      setError("Failed to generate report. Please try again.")
    } finally {
      setLoadingReportId(null)
    }
  }

  const selectedReport = selectedAssessmentId ? reportsByAssessmentId[selectedAssessmentId] : null
  const selectedChartData = selectedReport?.test_chart_data ?? []
  const chartType = (selectedReport?.test_charts || "").toLowerCase()
  const showsPieChart = chartType.includes("pie")
  const showsHistogram = chartType.includes("histogram")

  if (isLoading) {
    return (
      <Card className="p-8 border border-border">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <p className="text-foreground font-medium">Loading test results...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
          <Award className="w-8 h-8 text-primary" />
          Test Results
        </h2>
        <p className="text-muted-foreground">Generate and review your completed assessment reports</p>
      </div>

      {error && (
        <Card className="p-4 border border-red-200 bg-red-50 text-red-700">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </Card>
      )}

      {completedAssessments.length === 0 ? (
        <Card className="p-12 border border-border text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Completed Assessments Yet</h2>
          <p className="text-muted-foreground">Complete an assessment to generate your report here</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total Tests Completed</p>
                  <p className="text-3xl font-bold text-foreground">{totalTests}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Reports Generated</p>
                  <p className="text-3xl font-bold text-green-600">{reportsGeneratedCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <PieChartIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Avg Overall Score</p>
                  <p className="text-3xl font-bold text-primary">{averageOverallScore}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Completed Assessments</h3>
            {completedAssessments.map((assessment) => (
              <Card key={assessment.assessment_id} className="p-6 border border-border hover:shadow-lg transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg leading-tight">{assessment.test_name}</h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          Assessment Completed
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0">Completed</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Questions</p>
                        <p className="text-2xl font-bold text-primary">{assessment.total_questions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Duration</p>
                        <p className="text-2xl font-bold text-green-600">{assessment.test_duration}m</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Amount Paid</p>
                        <p className="text-2xl font-bold text-blue-600">Rs {assessment.amount_paid}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateAndShowReport(assessment.assessment_id)}
                      size="sm"
                      className="gap-2"
                      disabled={loadingReportId === assessment.assessment_id}
                    >
                      {loadingReportId === assessment.assessment_id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <PieChartIcon className="w-4 h-4" />
                          View Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedReport && (
            <Card className="p-6 md:p-8 border border-border bg-card">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedReport.test_name} Report</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Patient: {selectedReport.patient_data.first_name} {selectedReport.patient_data.last_name}
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">
                  Overall Score: {Number(selectedReport.overall_score || 0).toFixed(2)}
                </Badge>
              </div>

              {(showsPieChart || showsHistogram) && selectedChartData.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                  {showsPieChart && (
                    <Card className="p-4 border border-border">
                      <h4 className="font-semibold text-foreground mb-3">Sub-category Distribution (Pie)</h4>
                      <ChartContainer
                        className="h-[280px] w-full"
                        config={{
                          score: {
                            label: "Score",
                            color: "#2563eb",
                          },
                        }}
                      >
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Pie data={selectedChartData} dataKey="sub_category_score" nameKey="sub_category" outerRadius={95}>
                            {selectedChartData.map((_, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </Card>
                  )}

                  {showsHistogram && (
                    <Card className="p-4 border border-border">
                      <h4 className="font-semibold text-foreground mb-3">Sub-category Score (Histogram)</h4>
                      <ChartContainer
                        className="h-[280px] w-full"
                        config={{
                          sub_category_score: {
                            label: "Score",
                            color: "#14b8a6",
                          },
                        }}
                      >
                        <BarChart data={selectedChartData} margin={{ left: 12, right: 12 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="sub_category" tickLine={false} axisLine={false} tickMargin={8} />
                          <YAxis tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="sub_category_score" fill="var(--color-sub_category_score)" radius={6} />
                        </BarChart>
                      </ChartContainer>
                    </Card>
                  )}
                </div>
              )}

              {selectedReport.interpretation && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Result Interpretation</h4>
                    <p className="text-sm text-foreground">{selectedReport.interpretation.result || "Not available"}</p>
                    <p className="text-sm text-muted-foreground mt-3">
                      <span className="font-medium text-foreground">Advice:</span>{" "}
                      {selectedReport.interpretation.advice || "Not available"}
                    </p>
                  </Card>
                  <Card className="p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">Linked Symptoms & Conditions</h4>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Mental:</span>{" "}
                      {selectedReport.interpretation.symptoms?.mental || "Not available"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium text-foreground">Physical:</span>{" "}
                      {selectedReport.interpretation.symptoms?.physical || "Not available"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium text-foreground">Conditions:</span>{" "}
                      {selectedReport.interpretation.symptoms?.conditions_linked || "Not available"}
                    </p>
                  </Card>
                </div>
              )}

              {selectedChartData.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Sub-category Insights</h4>
                  {selectedChartData.map((category, idx) => (
                    <Card key={`${category.sub_category}-${idx}`} className="p-4 border border-border">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h5 className="font-semibold text-foreground">{category.sub_category.trim()}</h5>
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.sub_category_descriptor?.map((entry) => entry.test_descriptor).join(" | ") ||
                              "No descriptor available"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          Score: {Number(category.sub_category_score || 0).toFixed(2)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
