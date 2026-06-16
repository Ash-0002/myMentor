import { apiClient } from "@/lib/api-client"
import {
  normalizeAssessmentReport,
  type AssessmentReport,
  type AssessmentReportChartData,
} from "@/lib/assessment-report"
import { AssessmentReportPdf } from "@/lib/assessment-report-pdf"
import { pdf } from "@react-pdf/renderer"

export type {
  AssessmentReport,
  AssessmentReportChartData,
  AssessmentReportSubCategoryResult,
} from "@/lib/assessment-report"

const CHART_COLORS = ["#2563eb", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e"]

function sanitizeFileName(input: string) {
  return input.replace(/[^a-z0-9-_.]/gi, "_")
}

function createPieChartImage(data: AssessmentReportChartData[]) {
  const canvas = document.createElement("canvas")
  canvas.width = 720
  canvas.height = 440
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 20px Arial"
  ctx.fillText("Sub-category Distribution", 24, 34)

  const total = data.reduce((sum, item) => sum + Number(item.sub_category_score || 0), 0)
  if (total <= 0) return null

  const centerX = 230
  const centerY = 230
  const radius = 130
  let startAngle = -Math.PI / 2

  data.forEach((item, index) => {
    const value = Number(item.sub_category_score || 0)
    const slice = (value / total) * Math.PI * 2
    const endAngle = startAngle + slice

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = CHART_COLORS[index % CHART_COLORS.length]
    ctx.fill()

    startAngle = endAngle
  })

  let legendY = 90
  data.forEach((item, index) => {
    const value = Number(item.sub_category_score || 0)
    const percent = ((value / total) * 100).toFixed(1)

    ctx.fillStyle = CHART_COLORS[index % CHART_COLORS.length]
    ctx.fillRect(420, legendY - 12, 14, 14)
    ctx.fillStyle = "#111827"
    ctx.font = "13px Arial"
    ctx.fillText(`${item.sub_category.trim() || "Unnamed"} (${percent}%)`, 442, legendY)
    legendY += 24
  })

  return canvas.toDataURL("image/png")
}

function createHistogramImage(data: AssessmentReportChartData[]) {
  const canvas = document.createElement("canvas")
  canvas.width = 720
  canvas.height = 440
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 20px Arial"
  ctx.fillText("Sub-category Score (Histogram)", 24, 34)

  const chartX = 60
  const chartY = 70
  const chartWidth = 620
  const chartHeight = 300
  const maxScore = Math.max(1, ...data.map((item) => Number(item.sub_category_score || 0)))

  ctx.strokeStyle = "#cbd5e1"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(chartX, chartY)
  ctx.lineTo(chartX, chartY + chartHeight)
  ctx.lineTo(chartX + chartWidth, chartY + chartHeight)
  ctx.stroke()

  const barGap = 14
  const barWidth = Math.max(20, (chartWidth - barGap * (data.length + 1)) / Math.max(1, data.length))

  data.forEach((item, index) => {
    const score = Number(item.sub_category_score || 0)
    const barHeight = (score / maxScore) * (chartHeight - 24)
    const x = chartX + barGap + index * (barWidth + barGap)
    const y = chartY + chartHeight - barHeight

    ctx.fillStyle = "#14b8a6"
    ctx.fillRect(x, y, barWidth, barHeight)
    ctx.fillStyle = "#0f172a"
    ctx.font = "12px Arial"
    ctx.fillText(score.toFixed(1), x + 2, y - 6)

    const label = item.sub_category.trim() || "Unnamed"
    const shortLabel = label.length > 12 ? `${label.slice(0, 12)}...` : label
    ctx.save()
    ctx.translate(x + barWidth / 2, chartY + chartHeight + 10)
    ctx.rotate(-Math.PI / 5)
    ctx.font = "11px Arial"
    ctx.fillText(shortLabel, 0, 0)
    ctx.restore()
  })

  return canvas.toDataURL("image/png")
}

export async function downloadAssessmentReportFromData(assessmentId: string, report: AssessmentReport): Promise<void> {
  const categories = report.test_chart_data ?? []
  const chartType = (report.test_charts || "").toLowerCase()
  const generatedAt = new Date().toLocaleString()
  const pieImage = chartType.includes("pie") && categories.length > 0 ? createPieChartImage(categories) : null
  const histogramImage =
    chartType.includes("histogram") && categories.length > 0 ? createHistogramImage(categories) : null

  const reportDocument = AssessmentReportPdf({
    assessmentId,
    report,
    generatedAt,
    pieChartImage: pieImage,
    histogramImage,
  })

  const blob = await pdf(reportDocument).toBlob()

  const safeTestName = sanitizeFileName(report.test_name || "assessment")
  const safeAssessmentId = sanitizeFileName(assessmentId)
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = objectUrl
  anchor.download = `${safeTestName}-${safeAssessmentId}-report.pdf`
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

export async function fetchAssessmentReport(assessmentId: string): Promise<AssessmentReport> {
  const response = await apiClient.post<{
    data?: Record<string, unknown>
    message?: string
    status?: string
    report?: Record<string, unknown>
    patient?: Record<string, unknown>
  }>("/api/external/assessment-report/create", { assessment_id: assessmentId })

  const payload = response.data?.data ?? response.data
  const reportData = normalizeAssessmentReport(payload)
  if (!reportData) {
    throw new Error(response.data?.message || "Invalid report response")
  }

  return reportData
}

export async function downloadAssessmentReport(assessmentId: string): Promise<void> {
  const report = await fetchAssessmentReport(assessmentId)
  await downloadAssessmentReportFromData(assessmentId, report)
}
