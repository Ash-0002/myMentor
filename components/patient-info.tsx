import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DashboardUser,
  DashboardUserType,
  isAdminDashboardUser,
  isIndividualDashboardUser,
} from "@/lib/dashboard-user"

interface PatientInfoProps {
  user: DashboardUser | null
  userType: DashboardUserType | null
}

export default function PatientInfo({ user, userType }: PatientInfoProps) {
  const getDisplayValue = (value: unknown) => {
    if (typeof value === "string") {
      return value.trim() ? value : "Not available"
    }
    if (typeof value === "number") {
      return String(value)
    }
    return "Not available"
  }

  if (!user || !userType) {
    return (
      <Card className="p-4 md:p-6 border border-border bg-card">
        <p className="text-sm text-muted-foreground">Unable to load profile details. Please login again.</p>
      </Card>
    )
  }

  if (isAdminDashboardUser(user)) {
    return (
      <Card className="p-4 md:p-6 border border-border bg-card">
        <div className="mb-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            Hospital Information
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Hospital Name</p>
            <p className="text-xl md:text-2xl font-bold text-foreground">{user.hospital_name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Hospital ID</p>
              <p className="text-base text-foreground font-medium font-mono">{user.hospital_id}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Admin Name</p>
              <p className="text-base text-foreground font-medium">{`${user.first_name} ${user.last_name}`.trim()}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Doctor Name</p>
              <p className="text-base text-foreground font-medium">{user.doctor_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Phone</p>
              <p className="text-base text-foreground font-medium">{user.hospital_phone}</p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Email</p>
              <p className="text-base text-foreground font-medium">{user.hospital_email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Country</p>
              <p className="text-base text-foreground font-medium">{getDisplayValue(user.country)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Address</p>
            <p className="text-base text-foreground font-medium">{user.hospital_address}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!isIndividualDashboardUser(user)) {
    return null
  }

  return (
    <Card className="p-4 md:p-6 border border-border bg-card">
      <div className="mb-6">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
          Patient Information
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Patient Name</p>
          <p className="text-xl md:text-2xl font-bold text-foreground">{`${user.first_name} ${user.last_name}`.trim()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Patient ID</p>
            <p className="text-base text-foreground font-medium font-mono">{user.patient_id}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Gender</p>
            <p className="text-base text-foreground font-medium">{getDisplayValue(user.gender)}</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Username / Email</p>
            <p className="text-base text-foreground font-medium">{getDisplayValue(user.username || user.email)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Phone</p>
            <p className="text-base text-foreground font-medium">{getDisplayValue(user.phone)}</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Address</p>
            <p className="text-base text-foreground font-medium">{getDisplayValue(user.address)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Country</p>
            <p className="text-base text-foreground font-medium">{getDisplayValue(user.country)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
