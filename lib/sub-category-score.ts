export const SUB_CATEGORY_MAX_SCORE = 10

export type ScoreLevel = "low" | "medium" | "high"

export function getScorePercent(score: number, maxScore = SUB_CATEGORY_MAX_SCORE): number {
  if (!Number.isFinite(score) || maxScore <= 0) return 0
  return Math.min(100, Math.max(0, (score / maxScore) * 100))
}

export function getScoreLevel(score: number, maxScore = SUB_CATEGORY_MAX_SCORE): ScoreLevel {
  const percent = getScorePercent(score, maxScore)
  if (percent < 40) return "low"
  if (percent < 70) return "medium"
  return "high"
}

export function getScoreLevelLabel(level: ScoreLevel): string {
  switch (level) {
    case "low":
      return "Low"
    case "medium":
      return "Medium"
    case "high":
      return "High"
  }
}

export function getScoreBarColorClass(level: ScoreLevel): string {
  switch (level) {
    case "low":
      return "bg-red-500"
    case "medium":
      return "bg-amber-500"
    case "high":
      return "bg-emerald-500"
  }
}

export function getScoreBarColorHex(level: ScoreLevel): string {
  switch (level) {
    case "low":
      return "#ef4444"
    case "medium":
      return "#f59e0b"
    case "high":
      return "#10b981"
  }
}

export function getScoreTrackColorHex(level: ScoreLevel): string {
  switch (level) {
    case "low":
      return "#fee2e2"
    case "medium":
      return "#fef3c7"
    case "high":
      return "#d1fae5"
  }
}

export function getScoreBadgeColorClass(level: ScoreLevel): string {
  switch (level) {
    case "low":
      return "bg-red-500/10 text-red-700 border-red-200"
    case "medium":
      return "bg-amber-500/10 text-amber-700 border-amber-200"
    case "high":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-200"
  }
}

export function formatScoreBarText(score: number, maxScore = SUB_CATEGORY_MAX_SCORE): string {
  const percent = Math.round(getScorePercent(score, maxScore))
  const filled = Math.round(percent / 5)
  const empty = 20 - filled
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`
}
