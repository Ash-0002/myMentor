export interface AssessmentReportChartData {
  sub_category: string
  sub_category_score: number
  sub_category_descriptor?: Array<{
    test_descriptor_id: number
    test_descriptor: string
  }>
}

export interface AssessmentReport {
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
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 40
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const addWrappedText = (label: string, value?: string, fontSize = 11) => {
    if (!value) return
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(fontSize)
    pdf.text(label, margin, y)
    y += 14

    pdf.setFont("helvetica", "normal")
    const lines = pdf.splitTextToSize(value, contentWidth)
    pdf.text(lines, margin, y)
    y += lines.length * 14 + 8
  }

  const ensurePageSpace = (requiredHeight = 60) => {
    if (y + requiredHeight <= pageHeight - margin) return
    pdf.addPage()
    y = margin
  }

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(20)
  pdf.text("Assessment Report", margin, y)
  y += 24

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(11)
  pdf.text(`Assessment ID: ${assessmentId}`, margin, y)
  y += 18
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, y)
  y += 24

  ensurePageSpace()
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(14)
  pdf.text("Patient Details", margin, y)
  y += 18

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(11)
  const fullName = `${report.patient_data.first_name || ""} ${report.patient_data.last_name || ""}`.trim() || "N/A"
  pdf.text(`Name: ${fullName}`, margin, y)
  y += 15
  pdf.text(`Patient ID: ${report.patient_data.patient_id || "N/A"}`, margin, y)
  y += 15
  pdf.text(`Username: ${report.patient_data.username || "N/A"}`, margin, y)
  y += 24

  ensurePageSpace()
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(14)
  pdf.text("Assessment Summary", margin, y)
  y += 18

  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(11)
  pdf.text(`Test: ${report.test_name || "N/A"}`, margin, y)
  y += 15
  pdf.text(`Overall Score: ${Number(report.overall_score || 0).toFixed(2)}`, margin, y)
  y += 24

  ensurePageSpace(100)
  addWrappedText("Result Interpretation", report.interpretation?.result || "Not available")
  addWrappedText("Advice", report.interpretation?.advice || "Not available")
  addWrappedText("Mental Symptoms", report.interpretation?.symptoms?.mental || "Not available")
  addWrappedText("Physical Symptoms", report.interpretation?.symptoms?.physical || "Not available")
  addWrappedText("Linked Conditions", report.interpretation?.symptoms?.conditions_linked || "Not available")

  const categories = report.test_chart_data ?? []
  const chartType = (report.test_charts || "").toLowerCase()

  if (categories.length > 0 && (chartType.includes("pie") || chartType.includes("histogram"))) {
    ensurePageSpace(280)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.text("Charts", margin, y)
    y += 16

    if (chartType.includes("pie")) {
      const pieImage = createPieChartImage(categories)
      if (pieImage) {
        ensurePageSpace(220)
        pdf.addImage(pieImage, "PNG", margin, y, contentWidth, 190)
        y += 202
      }
    }

    if (chartType.includes("histogram")) {
      const histogramImage = createHistogramImage(categories)
      if (histogramImage) {
        ensurePageSpace(220)
        pdf.addImage(histogramImage, "PNG", margin, y, contentWidth, 190)
        y += 202
      }
    }
  }

  if (categories.length > 0) {
    ensurePageSpace(60)
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(14)
    pdf.text("Sub-category Insights", margin, y)
    y += 18

    for (const item of categories) {
      ensurePageSpace(75)
      const categoryName = (item.sub_category || "Unnamed Category").trim()
      const descriptors =
        item.sub_category_descriptor?.map((entry) => entry.test_descriptor).filter(Boolean).join(" | ") || "No descriptor available"

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(11)
      pdf.text(`${categoryName} (Score: ${Number(item.sub_category_score || 0).toFixed(2)})`, margin, y)
      y += 14

      pdf.setFont("helvetica", "normal")
      const descriptorLines = pdf.splitTextToSize(descriptors, contentWidth)
      pdf.text(descriptorLines, margin, y)
      y += descriptorLines.length * 14 + 10
    }
  }

  const safeTestName = sanitizeFileName(report.test_name || "assessment")
  const safeAssessmentId = sanitizeFileName(assessmentId)
  pdf.save(`${safeTestName}-${safeAssessmentId}-report.pdf`)
}
