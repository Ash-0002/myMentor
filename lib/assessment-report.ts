import { isIndividualDashboardUser, normalizeDashboardUser } from "@/lib/dashboard-user"
import { SUB_CATEGORY_MAX_SCORE } from "@/lib/sub-category-score"

export interface AssessmentReportDescriptor {
  test_descriptor_id: number
  test_descriptor: string
  sub_category_description?: string
}

export interface AssessmentReportChartData {
  sub_category: string
  sub_category_score: number
  sub_category_total_score?: number
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
  sub_category_total_score?: number
  sub_category_questions?: AssessmentReportQuestion[]
  sub_category_descriptor?: AssessmentReportDescriptor[]
  sub_category_selected_option?: AssessmentReportSelectedOption[]
}

export interface AssessmentReportPatientData {
  patient_id: string
  first_name: string
  last_name: string
  username: string
  role?: number | string
  email?: string
  patient_name?: string
  organization?: string
  report_id?: string
  assessment_type?: string
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

  const descriptors: AssessmentReportDescriptor[] = []

  for (const entry of value) {
    const row = asRecord(entry)
    if (!row) continue

    const descriptor: AssessmentReportDescriptor = {
      test_descriptor_id: Number(row.test_descriptor_id ?? 0),
      test_descriptor: String(row.test_descriptor ?? ""),
    }

    if (typeof row.sub_category_description === "string" && row.sub_category_description.trim()) {
      descriptor.sub_category_description = row.sub_category_description
    }

    if (descriptor.test_descriptor || descriptor.sub_category_description) {
      descriptors.push(descriptor)
    }
  }

  return descriptors
}

function parseChartData(value: unknown): AssessmentReportChartData[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => {
    const row = asRecord(entry) ?? {}
    const totalScore = Number(row.sub_category_total_score ?? 0)

    return {
      sub_category: String(row.sub_category ?? ""),
      sub_category_score: Number(row.sub_category_score ?? 0),
      sub_category_total_score: totalScore > 0 ? totalScore : undefined,
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

    const totalScore = Number(row.sub_category_total_score ?? 0)

    return {
      sub_category: String(row.sub_category ?? ""),
      sub_category_score: Number(row.sub_category_score ?? 0),
      sub_category_total_score: totalScore > 0 ? totalScore : undefined,
      sub_category_questions: questions,
      sub_category_descriptor: parseDescriptors(row.sub_category_descriptor),
      sub_category_selected_option: selectedOptions,
    }
  })
}

function parsePatientData(value: unknown): AssessmentReportPatientData | undefined {
  const row = asRecord(value)
  if (!row) return undefined

  const patientName = typeof row.patient_name === "string" ? row.patient_name.trim() : ""
  let firstName = String(row.first_name ?? "")
  let lastName = String(row.last_name ?? "")

  if (patientName && !firstName && !lastName) {
    const nameParts = patientName.split(/\s+/)
    firstName = nameParts[0] ?? ""
    lastName = nameParts.slice(1).join(" ")
  }

  const email = typeof row.email === "string" ? row.email : ""
  const username = String(row.username ?? email)

  return {
    patient_id: String(row.patient_id ?? ""),
    first_name: firstName,
    last_name: lastName,
    username,
    patient_name: patientName || undefined,
    email: email || undefined,
    organization: typeof row.organization === "string" ? row.organization : undefined,
    report_id: typeof row.report_id === "string" ? row.report_id : undefined,
    assessment_type: typeof row.assessment_type === "string" ? row.assessment_type : undefined,
    role:
      row.role !== undefined
        ? typeof row.role === "string"
          ? row.role
          : Number(row.role)
        : undefined,
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
  if (patient.patient_name) return patient.patient_name
  const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.trim()
  return fullName || patient.email || patient.username || patient.patient_id || "Patient"
}

export function formatDescriptorText(descriptor: string): string {
  return descriptor.replace(/\\n/g, "\n").trim()
}

export function getSubCategoryMaxScore(
  item: Pick<AssessmentReportSubCategoryResult, "sub_category_total_score">,
): number {
  const totalScore = Number(item.sub_category_total_score ?? 0)
  return Number.isFinite(totalScore) && totalScore > 0 ? totalScore : SUB_CATEGORY_MAX_SCORE
}

export interface SubCategoryDescriptorDisplay {
  label: string
  description: string
}

export function getSubCategoryDescriptorDisplay(
  descriptors?: AssessmentReportDescriptor[],
): SubCategoryDescriptorDisplay[] {
  if (!descriptors?.length) return []

  return descriptors
    .map((descriptor) => ({
      label: formatDescriptorText(descriptor.test_descriptor),
      description: formatDescriptorText(descriptor.sub_category_description ?? ""),
    }))
    .filter((entry) => entry.label || entry.description)
}

export type SubCategoryInsightItem = AssessmentReportSubCategoryResult

export function getSubCategoryInsightItems(report: AssessmentReport): SubCategoryInsightItem[] {
  if (report.sub_category_result.length > 0) {
    return report.sub_category_result
  }

  return (report.test_chart_data ?? []).map((item) => ({
    sub_category: item.sub_category,
    sub_category_score: item.sub_category_score,
    sub_category_total_score: item.sub_category_total_score,
    sub_category_descriptor: item.sub_category_descriptor,
  }))
}

export function normalizeAssessmentReport(raw: unknown): AssessmentReport | null {
  const data = asRecord(raw)
  if (!data) return null

  const reportSource = asRecord(data.report) ?? data
  const patientFromApi = parsePatientData(data.patient ?? data.patient_data)
  const patientFallback = getPatientDataFromStorage()

  return {
    test_name: String(reportSource.test_name ?? ""),
    overall_score: Number(reportSource.overall_score ?? 0),
    interpretation: parseInterpretation(reportSource.interpretation),
    test_charts: typeof reportSource.test_charts === "string" ? reportSource.test_charts : undefined,
    test_chart_data: parseChartData(reportSource.test_chart_data),
    sub_category_result: parseSubCategoryResult(reportSource.sub_category_result),
    patient_data: patientFromApi ?? patientFallback,
    completed_at: typeof reportSource.completed_at === "string" ? reportSource.completed_at : undefined,
    completion_date:
      typeof reportSource.completion_date === "string" ? reportSource.completion_date : undefined,
  }
}
