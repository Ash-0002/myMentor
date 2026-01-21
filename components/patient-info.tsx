import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PatientInfo() {
  return (
    <Card className="p-4 md:p-6 border border-border bg-card">
      <div className="mb-6">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
          Patient Information
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Patient Header */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Patient Name</p>
          <p className="text-xl md:text-2xl font-bold text-foreground">John Doe</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Address</p>
            <p className="text-base text-foreground font-medium">Noida Sector 135</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Secondary Address
            </p>
            <p className="text-base text-foreground font-medium">Noidr. Sector 135</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Patient ID</p>
            <p className="text-base text-foreground font-medium font-mono">091226576</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Attending Doctor</p>
            <div className="text-base text-foreground font-medium">
              <p>Dr. Hansh</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pincode</p>
          <p className="text-base text-foreground font-medium font-mono">201301</p>
        </div>
      </div>
    </Card>
  )
}
