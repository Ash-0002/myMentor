"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText } from "lucide-react"

interface ResultListItemProps {
  assessmentId: string
  testName: string
  completionDate?: string | null
  score?: number | null
  duration?: number | null
  onViewReport: () => void
  onDownloadReport: () => void
  isDownloading?: boolean
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export default function ResultListItem({
  assessmentId,
  testName,
  completionDate,
  score,
  duration,
  onViewReport,
  onDownloadReport,
  isDownloading,
}: ResultListItemProps) {
  return (
    <Card className="p-5 border border-border">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{testName}</h3>
          <p className="text-xs text-muted-foreground mt-1 font-mono">Assessment ID: {assessmentId}</p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-0">Completed</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground">Completion Date</p>
          <p className="font-semibold text-foreground">{formatDate(completionDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Score</p>
          <p className="font-semibold text-foreground">{score === undefined || score === null ? "N/A" : score.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Duration</p>
          <p className="font-semibold text-foreground">{duration ? `${duration} min` : "N/A"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <p className="font-semibold text-green-700">Completed</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={onViewReport} className="gap-2 bg-transparent">
          <FileText className="w-4 h-4" />
          View Report
        </Button>
        <Button onClick={onDownloadReport} className="gap-2" disabled={isDownloading}>
          <Download className="w-4 h-4" />
          {isDownloading ? "Generating..." : "Download Report"}
        </Button>
      </div>
    </Card>
  )
}
