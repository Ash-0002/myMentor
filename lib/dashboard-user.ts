export interface AdminDashboardUser {
  hospital_id: string
  first_name: string
  last_name: string
  username: string
  mobile: string
  email: string
  hospital_name: string
  hospital_phone: string
  hospital_email: string
  hospital_address: string
  doctor_name: string
  country: string | number
  role: number
}

export interface IndividualDashboardUser {
  patient_id: string
  username: string
  first_name: string
  last_name: string
  age: string | number
  gender: string
  phone: string
  email: string
  address: string
  role: number
  country: string | number
  hospital: string | null
}

export type DashboardUser = AdminDashboardUser | IndividualDashboardUser
export type DashboardUserType = "admin" | "individual"

export function isAdminDashboardUser(value: unknown): value is AdminDashboardUser {
  if (!value || typeof value !== "object") return false
  const user = value as Record<string, unknown>
  return typeof user.hospital_id === "string" && typeof user.hospital_name === "string"
}

export function isIndividualDashboardUser(value: unknown): value is IndividualDashboardUser {
  if (!value || typeof value !== "object") return false
  const user = value as Record<string, unknown>
  return typeof user.patient_id === "string" && typeof user.username === "string"
}

export function getDashboardUserType(user: DashboardUser): DashboardUserType {
  return isAdminDashboardUser(user) ? "admin" : "individual"
}

export function normalizeDashboardUser(value: unknown): DashboardUser | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  const roleCandidate = Number(raw.role)
  const role = Number.isFinite(roleCandidate) ? roleCandidate : undefined

  // New login response shape (patient login)
  if (raw.patient_detail && typeof raw.patient_detail === "object") {
    const detail = raw.patient_detail as Record<string, unknown>
    return {
      patient_id: String(detail.patient_id ?? ""),
      username: String(detail.username ?? ""),
      first_name: String(detail.first_name ?? ""),
      last_name: String(detail.last_name ?? ""),
      age: (detail.age as string | number | undefined) ?? "",
      gender: String(detail.gender ?? ""),
      phone: String(detail.phone ?? ""),
      email: String(detail.email ?? ""),
      address: String(detail.address ?? ""),
      role: Number(detail.role ?? role ?? 3),
      country: (detail.country as string | number | undefined) ?? "",
      hospital: detail.hospital ? String(detail.hospital) : null,
    }
  }

  // New login response shape (hospital admin login)
  if (raw.hospital_detail && typeof raw.hospital_detail === "object") {
    const detail = raw.hospital_detail as Record<string, unknown>
    return {
      hospital_id: String(detail.hospital_id ?? ""),
      first_name: String(detail.first_name ?? ""),
      last_name: String(detail.last_name ?? ""),
      username: String(detail.username ?? ""),
      mobile: String(detail.mobile ?? ""),
      email: String(detail.email ?? ""),
      hospital_name: String(detail.hospital_name ?? ""),
      hospital_phone: String(detail.hospital_phone ?? ""),
      hospital_email: String(detail.hospital_email ?? ""),
      hospital_address: String(detail.hospital_address ?? ""),
      doctor_name: String(detail.doctor_name ?? ""),
      country: (detail.country as string | number | undefined) ?? "",
      role: Number(raw.role ?? 5),
    }
  }

  if (isAdminDashboardUser(raw)) {
    return {
      hospital_id: String(raw.hospital_id ?? ""),
      first_name: String(raw.first_name ?? ""),
      last_name: String(raw.last_name ?? ""),
      username: String(raw.username ?? ""),
      mobile: String(raw.mobile ?? ""),
      email: String(raw.email ?? ""),
      hospital_name: String(raw.hospital_name ?? ""),
      hospital_phone: String(raw.hospital_phone ?? ""),
      hospital_email: String(raw.hospital_email ?? ""),
      hospital_address: String(raw.hospital_address ?? ""),
      doctor_name: String(raw.doctor_name ?? ""),
      country: (raw.country as string | number | undefined) ?? "",
      role: Number(raw.role ?? 5),
    }
  }

  if (isIndividualDashboardUser(raw)) {
    return {
      patient_id: String(raw.patient_id ?? ""),
      username: String(raw.username ?? ""),
      first_name: String(raw.first_name ?? ""),
      last_name: String(raw.last_name ?? ""),
      age: (raw.age as string | number | undefined) ?? "",
      gender: String(raw.gender ?? ""),
      phone: String(raw.phone ?? ""),
      email: String(raw.email ?? ""),
      address: String(raw.address ?? ""),
      role: Number(raw.role ?? 3),
      country: (raw.country as string | number | undefined) ?? "",
      hospital: raw.hospital ? String(raw.hospital) : null,
    }
  }

  return null
}
