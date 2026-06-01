"use client"

import { Mail, MapPin, Phone, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { IndividualDashboardUser } from "@/lib/dashboard-user"

interface ProfileCardProps {
  user: IndividualDashboardUser
}

export default function ProfileCard({ user }: ProfileCardProps) {
  const fullName = `${user.first_name} ${user.last_name}`.trim()

  const fields = [
    { label: "Age", value: String(user.age) },
    { label: "Gender", value: user.gender },
    { label: "Email", value: user.email, icon: Mail },
    { label: "Phone", value: user.phone, icon: Phone },
    { label: "Country", value: String(user.country) },
    { label: "Address", value: user.address, icon: MapPin },
  ]

  return (
    <Card className="border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-bold text-white shadow-lg shadow-violet-500/30">
          {user.first_name?.[0]?.toUpperCase() || <User className="h-7 w-7" />}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{fullName}</h3>
          <p className="text-sm text-slate-500">{user.username}</p>
          <Badge className="mt-2 border-0 bg-violet-500/10 text-violet-700">
            {user.role_name || "Individual Patient"}
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="rounded-xl bg-slate-50/80 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{field.label}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{field.value || "—"}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
