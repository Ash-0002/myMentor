"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"

interface ReportHeaderProps {
  testName: string
  patientName: string
  overallScore: number
  completionDate?: string | null
  onBack: () => void
  onDownload: () => void
  isDownloading?: boolean
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export default function ReportHeader({
  testName,
  patientName,
  overallScore,
  completionDate,
  onBack,
  onDownload,
  isDownloading,
}: ReportHeaderProps) {
  return (
    <Card className="p-5 md:p-6 border border-border">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{testName}</h1>
          <p className="text-sm text-muted-foreground">Patient: {patientName}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-0">Overall Score: {overallScore.toFixed(2)}</Badge>
            <Badge variant="secondary">Completion Date: {formatDate(completionDate)}</Badge>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button className="gap-2" onClick={onDownload} disabled={isDownloading}>
            <Download className="w-4 h-4" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
