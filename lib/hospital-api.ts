import { apiClient } from "@/lib/api-client"

export interface Hospital {
  id: string
  hospital_name: string
  doctor_name?: string
  hospital_address?: string
  hospital_email?: string
  hospital_phone?: string
}

export interface HospitalPatient {
  patient_id: string
  first_name?: string
  last_name?: string
  username?: string
  email?: string
  phone?: string
  gender?: string
  age?: number | string
  hospital?: string
}

function parseHospital(row: unknown): Hospital | null {
  if (!row || typeof row !== "object") return null
  const item = row as Record<string, unknown>
  const id = item.id ?? item.hospital_id
  if (typeof id !== "string" || !id) return null
  return {
    id,
    hospital_name: String(item.hospital_name ?? ""),
    doctor_name: item.doctor_name ? String(item.doctor_name) : undefined,
    hospital_address: item.hospital_address ? String(item.hospital_address) : undefined,
    hospital_email: item.hospital_email ? String(item.hospital_email) : undefined,
    hospital_phone: item.hospital_phone ? String(item.hospital_phone) : undefined,
  }
}

function parseHospitalPatient(row: unknown): HospitalPatient | null {
  if (!row || typeof row !== "object") return null
  const item = row as Record<string, unknown>
  const patientId = item.patient_id ?? item.id
  if (typeof patientId !== "string" || !patientId) return null
  return {
    patient_id: patientId,
    first_name: item.first_name ? String(item.first_name) : undefined,
    last_name: item.last_name ? String(item.last_name) : undefined,
    username: item.username ? String(item.username) : undefined,
    email: item.email ? String(item.email) : undefined,
    phone: item.phone ? String(item.phone) : undefined,
    gender: item.gender ? String(item.gender) : undefined,
    age: item.age as number | string | undefined,
    hospital: item.hospital ? String(item.hospital) : undefined,
  }
}

export async function fetchHospitals(): Promise<Hospital[]> {
  const response = await apiClient.get("/api/external/hospital", { timeout: 30000 })
  const list = response.data?.data
  if (!Array.isArray(list)) return []
  return list.map(parseHospital).filter((h): h is Hospital => Boolean(h?.hospital_name))
}

export async function fetchHospitalPatients(hospitalId: string): Promise<HospitalPatient[]> {
  const response = await apiClient.get("/api/external/hospital/patients", {
    params: { hospital_id: hospitalId },
    timeout: 30000,
  })
  const list = response.data?.data
  if (!Array.isArray(list)) return []
  return list.map(parseHospitalPatient).filter((p): p is HospitalPatient => Boolean(p))
}
