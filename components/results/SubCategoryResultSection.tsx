"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SubCategoryScoreBar from "@/components/results/SubCategoryScoreBar"
import {
  getSubCategoryDescriptorDisplay,
  getSubCategoryMaxScore,
  type SubCategoryInsightItem,
} from "@/lib/assessment-report"
import { getScoreBadgeColorClass, getScoreLevel, getScoreLevelLabel } from "@/lib/sub-category-score"

interface SubCategoryResultSectionProps {
  items: SubCategoryInsightItem[]
  title?: string
}

export default function SubCategoryResultSection({
  items,
  title = "Sub-category Insights",
}: SubCategoryResultSectionProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">{title}</h4>
      {items.map((item, idx) => {
        const score = Number(item.sub_category_score || 0)
        const maxScore = getSubCategoryMaxScore(item)
        const level = getScoreLevel(score, maxScore)
        const descriptors = getSubCategoryDescriptorDisplay(item.sub_category_descriptor)

        return (
          <Card key={`${item.sub_category}-${idx}`} className="space-y-4 border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h5 className="font-semibold text-foreground">
                {item.sub_category.trim()} ({score.toFixed(0)}/{maxScore})
              </h5>
              <Badge variant="outline" className={`border ${getScoreBadgeColorClass(level)}`}>
                {getScoreLevelLabel(level)}
              </Badge>
            </div>

            <SubCategoryScoreBar score={score} maxScore={maxScore} showLevel={false} />

            {descriptors.length > 0 && (
              <div className="space-y-3 border-t border-border pt-3">
                {descriptors.map((descriptor, descriptorIdx) => (
                  <div
                    key={`${item.sub_category}-descriptor-${descriptorIdx}`}
                    className="space-y-1 rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    {descriptor.label ? (
                      <p className="text-sm font-semibold text-foreground">{descriptor.label}</p>
                    ) : null}
                    {descriptor.description ? (
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {descriptor.description}
                      </p>
                    ) : null}
                  </div>
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
                      {selected?.selected_option && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Answer:</span>{" "}
                          {selected.selected_option}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
