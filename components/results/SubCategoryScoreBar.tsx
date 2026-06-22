"use client"

import { cn } from "@/lib/utils"
import {
  getScoreBarColorClass,
  getScoreLevel,
  getScoreLevelLabel,
  getScorePercent,
  SUB_CATEGORY_MAX_SCORE,
} from "@/lib/sub-category-score"

interface SubCategoryScoreBarProps {
  score: number
  maxScore?: number
  showLevel?: boolean
  className?: string
}

export default function SubCategoryScoreBar({
  score,
  maxScore = SUB_CATEGORY_MAX_SCORE,
  showLevel = true,
  className,
}: SubCategoryScoreBarProps) {
  const numericScore = Number(score || 0)
  const percent = getScorePercent(numericScore, maxScore)
  const level = getScoreLevel(numericScore, maxScore)
  const barColor = getScoreBarColorClass(level)

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-muted-foreground">
          {numericScore.toFixed(0)}/{maxScore}
        </span>
        <div className="flex items-center gap-2">
          {showLevel && (
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {getScoreLevelLabel(level)}
            </span>
          )}
          <span className="font-semibold tabular-nums text-foreground">{Math.round(percent)}%</span>
        </div>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Score ${numericScore} out of ${maxScore}`}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
