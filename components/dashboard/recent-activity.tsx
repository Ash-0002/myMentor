"use client"

import { Award, CreditCard, Download, FileCheck, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { PatientAssessment } from "@/lib/patient-assessments"
import { isCompletedAssessment } from "@/lib/patient-assessments"

interface ActivityItem {
  id: string
  icon: typeof Award
  title: string
  time: string
  color: string
}

function buildActivities(assessments: PatientAssessment[]): ActivityItem[] {
  const items: ActivityItem[] = []

  assessments.filter(isCompletedAssessment).slice(0, 2).forEach((a) => {
    items.push({
      id: `done-${a.assessment_id}`,
      icon: FileCheck,
      title: `Completed "${a.test}"`,
      time: "Recently",
      color: "bg-emerald-500",
    })
  })

  const paymentDate = typeof window !== "undefined" ? localStorage.getItem("paymentDate") : null
  if (paymentDate) {
    items.push({
      id: "payment",
      icon: CreditCard,
      title: "Payment successful",
      time: new Date(paymentDate).toLocaleDateString(),
      color: "bg-violet-500",
    })
  }

  items.push({
    id: "profile",
    icon: User,
    title: "Profile synced from login",
    time: "Session active",
    color: "bg-blue-500",
  })

  if (assessments.some(isCompletedAssessment)) {
    items.push({
      id: "report",
      icon: Download,
      title: "Report available for download",
      time: "Ready",
      color: "bg-fuchsia-500",
    })
  }

  items.push({
    id: "insight",
    icon: Award,
    title: "Wellness insights updated",
    time: "Today",
    color: "bg-amber-500",
  })

  return items.slice(0, 5)
}

export default function RecentActivity({ assessments }: { assessments: PatientAssessment[] }) {
  const activities = buildActivities(assessments)

  return (
    <Card className="border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <h3 className="font-semibold text-slate-900">Recent Activity</h3>
      <p className="mb-4 text-xs text-slate-500">Latest updates on your health journey</p>
      <ul className="space-y-4">
        {activities.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <item.icon className="h-4 w-4 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <p className="text-sm font-medium text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-500">{item.time}</p>
            </div>
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
