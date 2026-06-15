"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Loader2, Search, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { AdminDashboardUser } from "@/lib/dashboard-user"
import { fetchHospitalPatients, type HospitalPatient } from "@/lib/hospital-api"

interface AdminPatientsViewProps {
  user: AdminDashboardUser
}

function getPatientName(patient: HospitalPatient): string {
  const fullName = `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
  return fullName || patient.username || patient.patient_id
}

export default function AdminPatientsView({ user }: AdminPatientsViewProps) {
  const [patients, setPatients] = useState<HospitalPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const rows = await fetchHospitalPatients(user.hospital_id)
        setPatients(rows)
      } catch (err) {
        console.error("[admin] Failed to load hospital patients:", err)
        setError("Unable to load patients for this hospital.")
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    if (user.hospital_id) {
      void load()
    } else {
      setError("Hospital ID not found. Please login again.")
      setLoading(false)
    }
  }, [user.hospital_id])

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return patients
    return patients.filter((patient) => {
      const haystack = [
        patient.patient_id,
        patient.first_name,
        patient.last_name,
        patient.username,
        patient.email,
        patient.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [patients, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hospital Patients</h2>
          <p className="text-sm text-muted-foreground">
            Patients registered under {user.hospital_name}
          </p>
        </div>
        <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
          Hospital ID: {user.hospital_id}
        </Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, email, phone..."
          className="pl-9"
        />
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </Card>
      )}

      {loading ? (
        <Card className="flex items-center justify-center gap-3 border border-border p-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading patients...</span>
        </Card>
      ) : filteredPatients.length === 0 ? (
        <Card className="border border-border p-12 text-center">
          <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">No patients found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {search.trim()
              ? "Try a different search term."
              : "Hospital patients will appear here once they register and select your hospital."}
          </p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Patient</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Patient ID</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Contact</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.patient_id} className="border-t border-border">
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{getPatientName(patient)}</p>
                      {patient.username && (
                        <p className="text-xs text-muted-foreground">@{patient.username}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-foreground">{patient.patient_id}</td>
                    <td className="px-4 py-4">
                      <p className="text-foreground">{patient.email || "—"}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone || "—"}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {[patient.gender, patient.age ? `Age ${patient.age}` : null].filter(Boolean).join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
