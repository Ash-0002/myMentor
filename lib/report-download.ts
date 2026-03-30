import axios from "axios"

function triggerBrowserDownload(url: string, filename = "assessment-report.pdf") {
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.target = "_blank"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

function resolveReportUrl(payload: any): string | null {
  return payload?.report_url ?? payload?.data?.report_url ?? null
}

async function downloadFromUrl(reportUrl: string, fallbackFilename = "assessment-report.pdf") {
  try {
    const response = await axios.get(reportUrl, { responseType: "blob" })
    const blob = response.data as Blob
    if (!blob || blob.size === 0) {
      throw new Error("Empty report blob")
    }
    const blobUrl = URL.createObjectURL(blob)
    triggerBrowserDownload(blobUrl, fallbackFilename)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
  } catch {
    // Cross-origin or blocked fetch: fallback to open URL directly.
    window.open(reportUrl, "_blank", "noopener,noreferrer")
  }
}

export async function downloadAssessmentReport(assessmentId: string): Promise<void> {
  try {
    // First try JSON response which may contain a report URL.
    const jsonResponse = await axios.post("/api/external/assessment-report/create/", { assessment_id: assessmentId })
    const reportUrl = resolveReportUrl(jsonResponse.data)

    if (reportUrl) {
      await downloadFromUrl(reportUrl)
      return
    }
  } catch {
    // If JSON parsing/request fails, continue with binary fallback.
  }

  // Fallback for direct binary/pdf responses.
  const blobResponse = await axios.post(
    "/api/external/assessment-report/create/",
    { assessment_id: assessmentId },
    {
      responseType: "blob",
    },
  )

  const blob = blobResponse.data as Blob
  if (!blob || blob.size === 0) {
    throw new Error("Empty PDF response from server")
  }

  const blobUrl = URL.createObjectURL(blob)
  triggerBrowserDownload(blobUrl)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
}
