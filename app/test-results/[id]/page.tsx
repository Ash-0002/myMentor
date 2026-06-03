"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReportHeader from "@/components/results/ReportHeader"
import ChartSection from "@/components/results/ChartSection"
import ResultsNavigation from "@/components/results/ResultsNavigation"
import InterpretationSection from "@/components/results/InterpretationSection"
import SubCategoryResultSection from "@/components/results/SubCategoryResultSection"
import { formatDescriptorText, getPatientDisplayName, type AssessmentReport } from "@/lib/assessment-report"
import { downloadAssessmentReportFromData, fetchAssessmentReport } from "@/lib/report-download"

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
        const reportData = await fetchAssessmentReport(assessmentId)
        setReport(reportData)
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
    if (!assessmentId || !report) return
    setIsDownloading(true)
    try {
      await downloadAssessmentReportFromData(assessmentId, report)
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

  const chartInsights = report.test_chart_data ?? []

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <ResultsNavigation />

        <ReportHeader
          testName={report.test_name}
          patientName={getPatientDisplayName(report)}
          overallScore={Number(report.overall_score || 0)}
          completionDate={report.completed_at || report.completion_date}
          onBack={() => router.push("/test-results")}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />

        <ChartSection chartType={report.test_charts} chartData={chartInsights} />

        <InterpretationSection interpretation={report.interpretation} />

        <SubCategoryResultSection items={report.sub_category_result} />

        {chartInsights.length > 0 && report.sub_category_result.length === 0 && (
          <Card className="p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-3">Sub-category Insights</h4>
            <div className="space-y-3">
              {chartInsights.map((item, idx) => (
                <Card key={`${item.sub_category}-${idx}`} className="p-3 border border-border">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground">{item.sub_category}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {item.sub_category_descriptor
                          ?.map((d) => formatDescriptorText(d.test_descriptor))
                          .join("\n\n") || "No descriptor available"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                      Score: {Number(item.sub_category_score || 0)}
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
