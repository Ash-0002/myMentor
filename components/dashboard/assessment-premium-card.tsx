"use client"

import { ArrowRight, Brain, Clock, HeartPulse, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  getDisplayStatus,
  inferCategory,
  estimateDurationMinutes,
  type DisplayAssessmentStatus,
} from "@/lib/dashboard-utils"
import { getAssessmentProgress, type PatientAssessment } from "@/lib/patient-assessments"

const statusStyles: Record<DisplayAssessmentStatus, string> = {
  "Not Started": "bg-slate-500/15 text-slate-600 border-slate-200",
  "In Progress": "bg-amber-500/15 text-amber-700 border-amber-200",
  Completed: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
}

interface AssessmentPremiumCardProps {
  assessment: PatientAssessment
  purchasedLabel: string
  expiryLabel: string
  onContinue: () => void
  onViewResults?: () => void
}

export default function AssessmentPremiumCard({
  assessment,
  purchasedLabel,
  expiryLabel,
  onContinue,
  onViewResults,
}: AssessmentPremiumCardProps) {
  const status = getDisplayStatus(assessment)
  const progress = getAssessmentProgress(assessment)
  const category = inferCategory(assessment.test)
  const duration = estimateDurationMinutes(assessment.total_questions)
  const isCompleted = status === "Completed"

  const Icon = category === "Mental Health" ? Brain : category === "General Health" ? HeartPulse : Sparkles

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-80" />

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 text-violet-600 ring-1 ring-violet-500/20">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-snug text-slate-900 line-clamp-2">{assessment.test}</h3>
          <p className="mt-1 text-xs text-slate-500">Category: {category}</p>
        </div>
        <Badge variant="outline" className={`shrink-0 border ${statusStyles[status]}`}>
          {status}
        </Badge>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-semibold text-slate-700">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-violet-100 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500" />
        <p className="text-xs text-slate-500">
          {assessment.completed_questions} / {assessment.total_questions} questions completed
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-slate-400">Purchased</p>
          <p className="font-medium text-slate-700">{purchasedLabel}</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-slate-400">Expiry</p>
          <p className="font-medium text-slate-700">{expiryLabel}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <Clock className="h-3.5 w-3.5" />
        <span>Est. {duration} min</span>
      </div>

      <div className="mt-5">
        {isCompleted ? (
          <Button
            onClick={onViewResults}
            variant="outline"
            className="w-full rounded-xl border-violet-200 bg-violet-50/50 text-violet-700 hover:bg-violet-100"
          >
            View Results
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onContinue}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
          >
            {status === "Not Started" ? "Start Assessment" : "Continue Assessment"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  )
}
