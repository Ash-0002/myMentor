import {
  getAssessmentProgress,
  isCompletedAssessment,
  isPendingAssessment,
  type PatientAssessment,
} from "@/lib/patient-assessments"

export type DisplayAssessmentStatus = "Not Started" | "In Progress" | "Completed"

export interface DashboardStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  wellnessScore: number
}

export function getDisplayStatus(assessment: PatientAssessment): DisplayAssessmentStatus {
  if (isCompletedAssessment(assessment)) return "Completed"
  const progress = getAssessmentProgress(assessment)
  if (progress > 0) return "In Progress"
  return "Not Started"
}

export function inferCategory(testName: string): string {
  const name = testName.toLowerCase()
  if (name.includes("autism") || name.includes("mental") || name.includes("depression") || name.includes("anxiety")) {
    return "Mental Health"
  }
  if (name.includes("diabetes") || name.includes("cardio") || name.includes("heart")) {
    return "General Health"
  }
  return "Health Assessment"
}

export function computeDashboardStats(assessments: PatientAssessment[]): DashboardStats {
  const total = assessments.length
  const completed = assessments.filter(isCompletedAssessment).length
  const pending = assessments.filter(
    (a) => isPendingAssessment(a) && getAssessmentProgress(a) === 0,
  ).length
  const inProgress = assessments.filter(
    (a) => !isCompletedAssessment(a) && getAssessmentProgress(a) > 0,
  ).length

  const wellnessScore =
    total === 0
      ? 0
      : Math.round(
          assessments.reduce((sum, a) => sum + getAssessmentProgress(a), 0) / total,
        )

  return { total, completed, pending, inProgress, wellnessScore }
}

export function estimateDurationMinutes(totalQuestions: number): number {
  return Math.max(10, Math.round(totalQuestions * 0.75))
}
