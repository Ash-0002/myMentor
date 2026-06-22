"use client"

import { cn } from "@/lib/utils"
import {
  getScoreBarColorHex,
  getScoreLevel,
  getScoreLevelLabel,
  getScorePercent,
  getScoreTrackColorHex,
  SUB_CATEGORY_MAX_SCORE,
  type ScoreLevel,
} from "@/lib/sub-category-score"

interface SubCategoryScoreBarProps {
  score: number
  maxScore?: number
  showLevel?: boolean
  className?: string
}

const levelBadgeStyles: Record<ScoreLevel, string> = {
  low: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  high: "border-emerald-200 bg-emerald-50 text-emerald-700",
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
  const fillColor = getScoreBarColorHex(level)
  const trackColor = getScoreTrackColorHex(level)

  return (
    <div className={cn("rounded-lg border border-border/60 bg-muted/20 p-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-foreground">
          {numericScore.toFixed(0)}/{maxScore}
        </span>
        <div className="flex items-center gap-2">
          {showLevel && (
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                levelBadgeStyles[level],
              )}
            >
              {getScoreLevelLabel(level)}
            </span>
          )}
          <span className="text-sm font-bold tabular-nums text-foreground">{Math.round(percent)}%</span>
        </div>
      </div>

      <div
        className="h-4 w-full overflow-hidden rounded-full shadow-inner"
        style={{ backgroundColor: trackColor }}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Score ${numericScore} out of ${maxScore}`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
          style={{
            width: `${percent}%`,
            minWidth: percent > 0 ? "0.5rem" : 0,
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  )
}
