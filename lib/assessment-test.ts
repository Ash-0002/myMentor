import { apiClient } from "@/lib/api-client"

export const QUESTIONS_PAGE_SIZE = 10

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

export interface QuestionsPageResult {
  questions: AssessmentQuestionWithOptions[]
  totalCount: number
  nextPath: string | null
}

interface QuestionsOptionsResponse {
  status?: string
  count?: number
  next?: string | null
  previous?: string | null
  results?: unknown[]
}

function parseQuestionsFromRows(rows: unknown[]): AssessmentQuestionWithOptions[] {
  const questionMap = new Map<number, AssessmentQuestionWithOptions>()

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

  return Array.from(questionMap.values()).sort((a, b) => a.id - b.id)
}

function toProxyPath(nextUrl: string): string {
  const parsed = new URL(nextUrl)
  return `/api/external${parsed.pathname.replace(/^\/api/, "")}${parsed.search}`
}

export async function fetchQuestionsPage(
  testId: number,
  path?: string,
): Promise<QuestionsPageResult> {
  const requestPath =
    path ?? `/api/external/questions-options/${testId}?page_size=${QUESTIONS_PAGE_SIZE}`

  const response = await apiClient.get<QuestionsOptionsResponse>(requestPath)
  const rows = Array.isArray(response.data?.results) ? response.data.results : []
  const questions = parseQuestionsFromRows(rows)

  const nextUrl = response.data?.next
  const nextPath = nextUrl ? toProxyPath(nextUrl) : null
  const totalCount = Number(response.data?.count ?? questions.length)

  return { questions, totalCount, nextPath }
}

/** @deprecated Use fetchQuestionsPage for paginated loading. */
export async function fetchQuestionsWithOptions(
  testId: number,
): Promise<AssessmentQuestionWithOptions[]> {
  const allQuestions: AssessmentQuestionWithOptions[] = []
  let nextPath: string | null = `/api/external/questions-options/${testId}?page_size=${QUESTIONS_PAGE_SIZE}`

  while (nextPath) {
    const page = await fetchQuestionsPage(testId, nextPath)
    allQuestions.push(...page.questions)
    nextPath = page.nextPath
  }

  const questionMap = new Map<number, AssessmentQuestionWithOptions>()
  for (const question of allQuestions) {
    questionMap.set(question.id, question)
  }

  return Array.from(questionMap.values()).sort((a, b) => a.id - b.id)
}

export function mergeQuestions(
  existing: AssessmentQuestionWithOptions[],
  incoming: AssessmentQuestionWithOptions[],
): AssessmentQuestionWithOptions[] {
  const questionMap = new Map<number, AssessmentQuestionWithOptions>()
  for (const question of existing) {
    questionMap.set(question.id, question)
  }
  for (const question of incoming) {
    questionMap.set(question.id, question)
  }
  return Array.from(questionMap.values()).sort((a, b) => a.id - b.id)
}
