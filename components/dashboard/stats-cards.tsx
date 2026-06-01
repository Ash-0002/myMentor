"use client"

import { Activity, CheckCircle2, ClipboardList, Sparkles, TrendingUp } from "lucide-react"
import type { DashboardStats } from "@/lib/dashboard-utils"

const cards = [
  {
    key: "total" as const,
    label: "Total Assessments",
    icon: ClipboardList,
    color: "from-violet-500/20 to-violet-500/5 text-violet-600",
    trend: "+12% this month",
    trendUp: true,
  },
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600",
    trend: "On track",
    trendUp: true,
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: Activity,
    color: "from-amber-500/20 to-amber-500/5 text-amber-600",
    trend: "Action needed",
    trendUp: false,
  },
  {
    key: "wellnessScore" as const,
    label: "Wellness Score",
    icon: Sparkles,
    color: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-600",
    trend: "+8% improvement",
    trendUp: true,
  },
]

const assessmentModeCards = [
  { key: "total" as const, label: "Total Purchased", icon: ClipboardList, color: cards[0].color, trend: "All time", trendUp: true },
  { key: "completed" as const, label: "Completed", icon: CheckCircle2, color: cards[1].color, trend: "Finished", trendUp: true },
  { key: "inProgress" as const, label: "In Progress", icon: Activity, color: cards[2].color, trend: "Active now", trendUp: true },
  { key: "pending" as const, label: "Pending", icon: Sparkles, color: cards[3].color, trend: "Not started", trendUp: false },
]

export default function StatsCards({
  stats,
  mode = "dashboard",
}: {
  stats: DashboardStats
  mode?: "dashboard" | "assessments"
}) {
  const activeCards = mode === "assessments" ? assessmentModeCards : cards

  const values: Record<string, number> = {
    total: stats.total,
    completed: stats.completed,
    pending: stats.pending,
    inProgress: stats.inProgress,
    wellnessScore: stats.wellnessScore,
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {activeCards.map((card) => (
        <div
          key={card.key}
          className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 ${card.color}`}>
            <card.icon className="h-5 w-5" />
          </div>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {mode === "dashboard" && card.key === "pending"
              ? stats.pending + stats.inProgress
              : values[card.key]}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">{card.label}</p>
          <p
            className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              card.trendUp ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            <TrendingUp className={`h-3 w-3 ${card.trendUp ? "" : "rotate-180"}`} />
            {card.trend}
          </p>
        </div>
      ))}
    </div>
  )
}
