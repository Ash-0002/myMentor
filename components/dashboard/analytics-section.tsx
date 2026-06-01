"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/dashboard-utils"
import { getAssessmentProgress, type PatientAssessment } from "@/lib/patient-assessments"

const PIE_COLORS = ["#8b5cf6", "#f59e0b", "#94a3b8"]

interface AnalyticsSectionProps {
  assessments: PatientAssessment[]
  stats: DashboardStats
}

export default function AnalyticsSection({ assessments, stats }: AnalyticsSectionProps) {
  const progressData = assessments.slice(0, 6).map((a, i) => ({
    name: `W${i + 1}`,
    score: getAssessmentProgress(a),
    label: a.test.slice(0, 12),
  }))

  const pieData = [
    { name: "Completed", value: stats.completed },
    { name: "In Progress", value: stats.inProgress },
    { name: "Pending", value: stats.pending },
  ].filter((d) => d.value > 0)

  const weeklyActivity = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
    day,
    activity: Math.min(100, stats.wellnessScore + (i % 3) * 8 - 4),
  }))

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Assessment Progress</h3>
            <p className="text-xs text-slate-500">Completion trend across your tests</p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
            +{stats.wellnessScore}% avg
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressData.length ? progressData : [{ name: "—", score: 0 }]}>
              <defs>
                <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#progressFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <h3 className="font-semibold text-slate-900">Assessment Breakdown</h3>
        <p className="mb-2 text-xs text-slate-500">Status distribution</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ name: "No data", value: 1 }]}
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
              >
                {(pieData.length ? pieData : [{ name: "No data", value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-1.5">
          {pieData.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                {item.name}
              </span>
              <span className="font-medium text-slate-800">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="col-span-1 border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm lg:col-span-3">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="font-semibold text-slate-900">Weekly Activity</h3>
            <p className="text-xs text-slate-500">Engagement over the last 7 days</p>
          </div>
          <div className="rounded-xl bg-violet-50 px-4 py-2 text-sm">
            <span className="text-slate-500">Health insight: </span>
            <span className="font-medium text-violet-700">
              {stats.completed > 0
                ? "Great momentum — keep completing assessments."
                : "Start your first assessment to unlock insights."}
            </span>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="activity" fill="#a78bfa" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
