"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReportHeader from "@/components/results/ReportHeader"
import ChartSection from "@/components/results/ChartSection"
import ResultsNavigation from "@/components/results/ResultsNavigation"
import { downloadAssessmentReport } from "@/lib/report-download"

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
  completed_at?: string
  completion_date?: string
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

export default function TestResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = String(Array.isArray(params.id) ? params.id[0] : params.id || "")

  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<AssessmentReport | null>(null)

  useEffect(() => {
    const loadReport = async () => {
      if (!assessmentId) {
        setError("Invalid assessment id")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const response = await axios.post<{ data?: AssessmentReport; message?: string }>(
          "/api/external/assessment-report/create",
          { assessment_id: assessmentId },
        )

        if (!response.data?.data) {
          throw new Error(response.data?.message || "Invalid report response")
        }

        setReport(response.data.data)
      } catch (err) {
        console.error("[v0] Error loading report detail:", err)
        setError("Unable to load report details.")
      } finally {
        setIsLoading(false)
      }
    }

    loadReport()
  }, [assessmentId])

  const handleDownload = async () => {
    if (!assessmentId) return
    setIsDownloading(true)
    try {
      await downloadAssessmentReport(assessmentId)
    } catch (err) {
      console.error("[v0] Download report error:", err)
      alert("Failed to generate report PDF.")
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <Card className="p-8 border border-border">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-foreground font-medium">Loading report details...</p>
          </div>
        </Card>
      </main>
    )
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <Card className="p-8 border border-border text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-foreground font-semibold">{error || "Report not found."}</p>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ResultsNavigation />

        <ReportHeader
          testName={report.test_name}
          patientName={`${report.patient_data.first_name} ${report.patient_data.last_name}`.trim()}
          overallScore={Number(report.overall_score || 0)}
          completionDate={report.completed_at || report.completion_date}
          onBack={() => router.push("/test-results")}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />

        <ChartSection chartType={report.test_charts} chartData={report.test_chart_data ?? []} />

        {report.interpretation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Result Interpretation</h4>
              <p className="text-sm text-foreground">{report.interpretation.result || "Not available"}</p>
              <p className="text-sm text-muted-foreground mt-3">
                <span className="font-medium text-foreground">Advice:</span> {report.interpretation.advice || "Not available"}
              </p>
            </Card>
            <Card className="p-4 border border-border">
              <h4 className="font-semibold text-foreground mb-2">Linked Symptoms & Conditions</h4>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Mental:</span> {report.interpretation.symptoms?.mental || "Not available"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium text-foreground">Physical:</span> {report.interpretation.symptoms?.physical || "Not available"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium text-foreground">Conditions:</span>{" "}
                {report.interpretation.symptoms?.conditions_linked || "Not available"}
              </p>
            </Card>
          </div>
        )}

        {(report.test_chart_data?.length ?? 0) > 0 && (
          <Card className="p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-3">Sub-category Insights</h4>
            <div className="space-y-3">
              {(report.test_chart_data || []).map((item, idx) => (
                <Card key={`${item.sub_category}-${idx}`} className="p-3 border border-border">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground">{item.sub_category}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.sub_category_descriptor?.map((d) => d.test_descriptor).join(" | ") || "No descriptor available"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                      Score: {Number(item.sub_category_score || 0).toFixed(2)}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
