import { isIndividualDashboardUser, normalizeDashboardUser } from "@/lib/dashboard-user"

export interface AssessmentReportDescriptor {
  test_descriptor_id: number
  test_descriptor: string
}

export interface AssessmentReportChartData {
  sub_category: string
  sub_category_score: number
  sub_category_descriptor?: AssessmentReportDescriptor[]
}

export interface AssessmentReportQuestion {
  question: string
  question_id: number
}

export interface AssessmentReportSelectedOption {
  selected_option: string
  selected_option_id: number
}

export interface AssessmentReportSubCategoryResult {
  sub_category: string
  sub_category_score: number
  sub_category_questions?: AssessmentReportQuestion[]
  sub_category_descriptor?: AssessmentReportDescriptor[]
  sub_category_selected_option?: AssessmentReportSelectedOption[]
}

export interface AssessmentReportPatientData {
  patient_id: string
  first_name: string
  last_name: string
  username: string
  role?: number
}

export interface AssessmentReport {
  test_name: string
  overall_score: number
  interpretation: string
  test_charts?: string
  test_chart_data: AssessmentReportChartData[]
  sub_category_result: AssessmentReportSubCategoryResult[]
  patient_data?: AssessmentReportPatientData
  completed_at?: string
  completion_date?: string
}

export interface AssessmentReportApiResponse {
  status?: string
  message?: string
  data?: Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null
}

export function parseInterpretation(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return ""
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        return String(JSON.parse(trimmed))
      } catch {
        return trimmed
      }
    }
    return trimmed
  }

  const legacy = asRecord(value)
  if (!legacy) return ""

  const parts: string[] = []
  if (typeof legacy.result === "string") parts.push(legacy.result)
  if (typeof legacy.advice === "string") parts.push(legacy.advice)

  const symptoms = asRecord(legacy.symptoms)
  if (symptoms) {
    if (typeof symptoms.mental === "string") parts.push(`Mental: ${symptoms.mental}`)
    if (typeof symptoms.physical === "string") parts.push(`Physical: ${symptoms.physical}`)
    if (typeof symptoms.conditions_linked === "string") {
      parts.push(`Conditions: ${symptoms.conditions_linked}`)
    }
  }

  return parts.join("\n\n")
}

function parseDescriptors(value: unknown): AssessmentReportDescriptor[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      const row = asRecord(entry)
      if (!row) return null
      return {
        test_descriptor_id: Number(row.test_descriptor_id ?? 0),
        test_descriptor: String(row.test_descriptor ?? ""),
      }
    })
    .filter((entry): entry is AssessmentReportDescriptor => Boolean(entry?.test_descriptor))
}

function parseChartData(value: unknown): AssessmentReportChartData[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    const row = asRecord(entry) ?? {}
    return {
      sub_category: String(row.sub_category ?? ""),
      sub_category_score: Number(row.sub_category_score ?? 0),
      sub_category_descriptor: parseDescriptors(row.sub_category_descriptor),
    }
  })
}

function parseSubCategoryResult(value: unknown): AssessmentReportSubCategoryResult[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    const row = asRecord(entry) ?? {}
    const questions = Array.isArray(row.sub_category_questions)
      ? row.sub_category_questions.map((q) => {
          const question = asRecord(q) ?? {}
          return {
            question: String(question.question ?? ""),
            question_id: Number(question.question_id ?? 0),
          }
        })
      : []

    const selectedOptions = Array.isArray(row.sub_category_selected_option)
      ? row.sub_category_selected_option.map((o) => {
          const option = asRecord(o) ?? {}
          return {
            selected_option: String(option.selected_option ?? ""),
            selected_option_id: Number(option.selected_option_id ?? 0),
          }
        })
      : []

    return {
      sub_category: String(row.sub_category ?? ""),
      sub_category_score: Number(row.sub_category_score ?? 0),
      sub_category_questions: questions,
      sub_category_descriptor: parseDescriptors(row.sub_category_descriptor),
      sub_category_selected_option: selectedOptions,
    }
  })
}

function parsePatientData(value: unknown): AssessmentReportPatientData | undefined {
  const row = asRecord(value)
  if (!row) return undefined
  return {
    patient_id: String(row.patient_id ?? ""),
    first_name: String(row.first_name ?? ""),
    last_name: String(row.last_name ?? ""),
    username: String(row.username ?? ""),
    role: row.role !== undefined ? Number(row.role) : undefined,
  }
}

export function getPatientDataFromStorage(): AssessmentReportPatientData | undefined {
  if (typeof window === "undefined") return undefined
  try {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) return undefined
    const normalized = normalizeDashboardUser(JSON.parse(storedUser))
    if (!normalized || !isIndividualDashboardUser(normalized)) return undefined
    return {
      patient_id: normalized.patient_id,
      first_name: normalized.first_name,
      last_name: normalized.last_name,
      username: normalized.username ?? "",
    }
  } catch {
    return undefined
  }
}

export function getPatientDisplayName(report: AssessmentReport): string {
  const patient = report.patient_data
  if (!patient) return "Patient"
  const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
  return fullName || patient.username || patient.patient_id || "Patient"
}

export function formatDescriptorText(descriptor: string): string {
  return descriptor.replace(/\\n/g, "\n").trim()
}

export function normalizeAssessmentReport(raw: unknown): AssessmentReport | null {
  const data = asRecord(raw)
  if (!data) return null

  const patientFromApi = parsePatientData(data.patient_data)
  const patientFallback = getPatientDataFromStorage()

  return {
    test_name: String(data.test_name ?? ""),
    overall_score: Number(data.overall_score ?? 0),
    interpretation: parseInterpretation(data.interpretation),
    test_charts: typeof data.test_charts === "string" ? data.test_charts : undefined,
    test_chart_data: parseChartData(data.test_chart_data),
    sub_category_result: parseSubCategoryResult(data.sub_category_result),
    patient_data: patientFromApi ?? patientFallback,
    completed_at: typeof data.completed_at === "string" ? data.completed_at : undefined,
    completion_date: typeof data.completion_date === "string" ? data.completion_date : undefined,
  }
}
