import { apiClient } from "@/lib/api-client"

export interface AssessmentQuestion {
  id: number
  question: string
}

export interface AssessmentOption {
  id: number
  question_id: number
  option: string
  option_no: number
  weightage?: number
}

export interface AssessmentQuestionWithOptions extends AssessmentQuestion {
  options: AssessmentOption[]
}

interface QuestionsOptionsResponse {
  status?: string
  count?: number
  next?: string | null
  previous?: string | null
  results?: unknown[]
}

export async function fetchQuestionsWithOptions(
  testId: number,
): Promise<AssessmentQuestionWithOptions[]> {
  const questionMap = new Map<number, AssessmentQuestionWithOptions>()
  let nextPath = `/api/external/questions-options/${testId}`

  while (nextPath) {
    const response = await apiClient.get<QuestionsOptionsResponse>(nextPath)
    const rows = Array.isArray(response.data?.results) ? response.data.results : []

    for (const item of rows) {
      const row = (item ?? {}) as Record<string, unknown>
      const questionId = Number(row.id)
      const questionText = String(row.question ?? "")
      if (!Number.isFinite(questionId) || questionId <= 0 || !questionText) continue

      const optionsRaw = Array.isArray(row.options) ? row.options : []
      const options: AssessmentOption[] = optionsRaw
        .map((o) => {
          const opt = (o ?? {}) as Record<string, unknown>
          return {
            id: Number(opt.id),
            question_id: Number(opt.question_id ?? questionId),
            option: String(opt.option ?? ""),
            option_no: Number(opt.option_no ?? 0),
            weightage: Number(opt.weightage ?? 0),
          }
        })
        .filter((o) => Number.isFinite(o.id) && Number.isFinite(o.question_id))
        .sort((a, b) => a.option_no - b.option_no)

      questionMap.set(questionId, {
        id: questionId,
        question: questionText,
        options,
      })
    }

    const nextUrl = response.data?.next
    if (!nextUrl) {
      nextPath = ""
      continue
    }

    // API returns absolute URL in `next`; convert to local proxy path.
    const parsed = new URL(nextUrl)
    nextPath = `/api/external${parsed.pathname.replace(/^\/api/, "")}${parsed.search}`
  }

  return Array.from(questionMap.values()).sort((a, b) => a.id - b.id)
}
