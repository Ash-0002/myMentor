"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  formatDescriptorText,
  type AssessmentReportSubCategoryResult,
} from "@/lib/assessment-report"

interface SubCategoryResultSectionProps {
  items: AssessmentReportSubCategoryResult[]
}

export default function SubCategoryResultSection({ items }: SubCategoryResultSectionProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">Sub-category Breakdown</h4>
      {items.map((item, idx) => (
        <Card key={`${item.sub_category}-${idx}`} className="space-y-4 border border-border p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h5 className="font-semibold text-foreground">{item.sub_category.trim()}</h5>
            <Badge variant="secondary" className="border-0 bg-primary/10 text-primary">
              Score: {Number(item.sub_category_score || 0)}
            </Badge>
          </div>

          {item.sub_category_descriptor && item.sub_category_descriptor.length > 0 && (
            <div className="space-y-2">
              {item.sub_category_descriptor.map((descriptor) => (
                <p
                  key={descriptor.test_descriptor_id}
                  className="whitespace-pre-wrap text-sm text-muted-foreground"
                >
                  {formatDescriptorText(descriptor.test_descriptor)}
                </p>
              ))}
            </div>
          )}

          {item.sub_category_questions && item.sub_category_questions.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Questions & Responses
              </p>
              {item.sub_category_questions.map((question, questionIdx) => {
                const selected = item.sub_category_selected_option?.[questionIdx]
                return (
                  <div
                    key={`${question.question_id}-${questionIdx}`}
                    className="rounded-lg border border-border bg-muted/20 p-3"
                  >
                    <p className="text-sm font-medium text-foreground">{question.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Answer:</span>{" "}
                      {selected?.selected_option || "Not available"}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
