"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Award, AlertCircle, Loader2, PieChart as PieChartIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import ResultListItem from "@/components/results/ResultListItem"
import { isIndividualDashboardUser, normalizeDashboardUser } from "@/lib/dashboard-user"
import { downloadAssessmentReport } from "@/lib/report-download"
import ResultsNavigation from "@/components/results/ResultsNavigation"

interface AssessmentRow {
  assessment_id: string
  assessment_status: string
  test_name: string
  test_duration: number
  total_questions: number
  amount_paid: number
  completed_at?: string
  completion_date?: string
  overall_score?: number
}

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

export default function TestResultsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<AssessmentRow[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const patientId = getPatientIdFromStorage()
        if (!patientId) {
          setError("Unable to find patient session. Please login again.")
          setRows([])
          return
        }

        const response = await axios.get<{ data?: AssessmentRow[] }>(
          `/api/external/patient/assessments?patient_id=${encodeURIComponent(patientId)}`,
        )
        const list = Array.isArray(response.data?.data) ? response.data.data : []
        const completed = list.filter((item) => (item.assessment_status || "").toLowerCase() === "completed")
        completed.sort((a, b) => {
          const aDate = new Date(a.completed_at || a.completion_date || 0).getTime()
          const bDate = new Date(b.completed_at || b.completion_date || 0).getTime()
          return bDate - aDate
        })
        setRows(completed)
      } catch (err) {
        console.error("[v0] Error loading test results list:", err)
        setError("Unable to load test results.")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const reportsGenerated = rows.length
  const avgOverallScore = useMemo(() => {
    const scoreRows = rows.filter((item) => typeof item.overall_score === "number")
    if (scoreRows.length === 0) return 0
    const total = scoreRows.reduce((sum, item) => sum + Number(item.overall_score || 0), 0)
    return Number((total / scoreRows.length).toFixed(2))
  }, [rows])

  const handleDownload = async (assessmentId: string) => {
    setDownloadingId(assessmentId)
    try {
      await downloadAssessmentReport(assessmentId)
    } catch (err) {
      console.error("[v0] Download report error:", err)
      alert("Failed to generate report PDF.")
    } finally {
      setDownloadingId(null)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <Card className="p-8 border border-border">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-foreground font-medium">Loading test results...</p>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ResultsNavigation />

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 mb-2">
            <Award className="w-8 h-8 text-primary" />
            Test Results
          </h2>
          <p className="text-muted-foreground">Review completed assessments and open detailed reports</p>
        </div>

        {error && (
          <Card className="p-4 border border-red-200 bg-red-50 text-red-700">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Total Tests Completed</p>
            <p className="text-3xl font-bold text-foreground">{rows.length}</p>
          </Card>
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Reports Generated</p>
            <p className="text-3xl font-bold text-green-600">{reportsGenerated}</p>
          </Card>
          <Card className="p-6 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Avg Overall Score</p>
            <p className="text-3xl font-bold text-primary">{avgOverallScore}</p>
          </Card>
        </div>

        {rows.length === 0 ? (
          <Card className="p-12 border border-border text-center">
            <PieChartIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Completed Tests Yet</h2>
            <p className="text-muted-foreground">Complete an assessment to see results here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((item) => (
              <ResultListItem
                key={item.assessment_id}
                assessmentId={item.assessment_id}
                testName={item.test_name}
                completionDate={item.completed_at || item.completion_date}
                score={item.overall_score}
                duration={item.test_duration}
                isDownloading={downloadingId === item.assessment_id}
                onViewReport={() => router.push(`/test-results/${item.assessment_id}`)}
                onDownloadReport={() => handleDownload(item.assessment_id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
