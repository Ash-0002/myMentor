"use client"

import { Card } from "@/components/ui/card"

interface InterpretationSectionProps {
  interpretation: string
}

export default function InterpretationSection({ interpretation }: InterpretationSectionProps) {
  if (!interpretation.trim()) return null

  return (
    <Card className="border border-border p-4 md:p-6">
      <h4 className="mb-3 font-semibold text-foreground">Overall Interpretation</h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{interpretation}</p>
    </Card>
  )
}
