"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AssessmentPremiumCard from "@/components/dashboard/assessment-premium-card"
import StatsCards from "@/components/dashboard/stats-cards"
import type { IndividualDashboardUser } from "@/lib/dashboard-user"
import {
  computeDashboardStats,
  getDisplayStatus,
  getPaymentDates,
  inferCategory,
} from "@/lib/dashboard-utils"
import {
  fetchPatientAssessments,
  resolveTestIdForAssessment,
  type PatientAssessment,
} from "@/lib/patient-assessments"

interface PatientAssessmentsPageProps {
  user: IndividualDashboardUser
  onViewResults: (assessmentId: string) => void
}

export default function PatientAssessmentsPage({ user, onViewResults }: PatientAssessmentsPageProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState<PatientAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("progress-desc")
  const { purchased, expiry } = getPaymentDates()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        setAssessments(await fetchPatientAssessments(user.patient_id))
      } catch {
        setAssessments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.patient_id])

  const stats = computeDashboardStats(assessments)

  const filtered = useMemo(() => {
    let list = [...assessments]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => a.test.toLowerCase().includes(q))
    }

    if (statusFilter !== "all") {
      list = list.filter((a) => getDisplayStatus(a).toLowerCase().replace(" ", "-") === statusFilter)
    }

    if (categoryFilter !== "all") {
      list = list.filter((a) => inferCategory(a.test) === categoryFilter)
    }

    list.sort((a, b) => {
      if (sortBy === "name-asc") return a.test.localeCompare(b.test)
      if (sortBy === "name-desc") return b.test.localeCompare(a.test)
      const pa = a.completed_questions / (a.total_questions || 1)
      const pb = b.completed_questions / (b.total_questions || 1)
      return sortBy === "progress-asc" ? pa - pb : pb - pa
    })

    return list
  }, [assessments, search, statusFilter, categoryFilter, sortBy])

  const categories = useMemo(
    () => [...new Set(assessments.map((a) => inferCategory(a.test)))],
    [assessments],
  )

  const handleContinue = (assessment: PatientAssessment) => {
    const testId = resolveTestIdForAssessment(assessment.test)
    if (!testId) {
      alert("Unable to start this assessment. Please complete payment for this test first.")
      return
    }
    router.push(`/assessment/${testId}/${assessment.assessment_id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Assessments</h2>
        <p className="text-sm text-slate-500">Search, filter, and manage your purchased tests</p>
      </div>

      <StatsCards stats={stats} mode="assessments" />

      <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-slate-200 pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full rounded-xl lg:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full rounded-xl lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full rounded-xl lg:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="progress-desc">Progress (high)</SelectItem>
            <SelectItem value="progress-asc">Progress (low)</SelectItem>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-slate-500">No assessments match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <AssessmentPremiumCard
              key={item.assessment_id}
              assessment={item}
              purchasedLabel={purchased}
              expiryLabel={expiry}
              onContinue={() => handleContinue(item)}
              onViewResults={() => onViewResults(item.assessment_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
