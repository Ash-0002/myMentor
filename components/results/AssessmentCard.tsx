"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react"

interface AssessmentCardProps {
  assessmentId: string
  title: string
  questions: number
  duration: number
  amountPaid: number
  status: string
  progressPercentage: number
  onContinue: () => void
  onViewResults: () => void
}

export default function AssessmentCard({
  title,
  questions,
  duration,
  amountPaid,
  status,
  progressPercentage,
  onContinue,
  onViewResults,
}: AssessmentCardProps) {
  const normalizedStatus = (status || "").toLowerCase()
  const isCompleted = normalizedStatus === "completed"
  const isPending = normalizedStatus === "pending" || normalizedStatus === "in progress"

  const statusColor = isCompleted
    ? "bg-green-100 text-green-700"
    : isPending
      ? "bg-yellow-100 text-yellow-700"
      : "bg-blue-100 text-blue-700"

  const statusIcon = isCompleted ? (
    <CheckCircle className="w-5 h-5" />
  ) : isPending ? (
    <Clock className="w-5 h-5" />
  ) : (
    <AlertCircle className="w-5 h-5" />
  )

  const progress = isCompleted ? 100 : Math.max(0, Math.min(100, progressPercentage))
  const progressColor = isCompleted ? "bg-green-600" : "bg-blue-600"

  return (
    <Card className="p-6 border border-border hover:shadow-lg transition-all">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="text-lg font-semibold text-foreground leading-tight">{title}</h3>
          <Badge className={`${statusColor} border-0 flex-shrink-0 gap-1`}>
            {statusIcon}
            <span className="capitalize text-xs">{status}</span>
          </Badge>
        </div>
      </div>

      <div className="space-y-3 mb-4 pb-4 border-b border-input">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Questions</span>
          <span className="font-semibold text-foreground">{questions}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-semibold text-foreground">{duration} minutes</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Amount Paid</span>
          <span className="font-semibold text-foreground">Rs {amountPaid}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div className={`${progressColor} h-2 rounded-full transition-all`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {isCompleted ? (
        <Button onClick={onViewResults} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
          View Results
          <ArrowRight className="w-4 h-4" />
        </Button>
      ) : (
        <Button onClick={onContinue} className="w-full gap-2 bg-primary hover:bg-primary/90">
          Continue Assessment
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </Card>
  )
}
