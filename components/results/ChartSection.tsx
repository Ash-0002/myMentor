"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AssessmentReportChartData {
  sub_category: string
  sub_category_score: number
}

interface ChartSectionProps {
  chartType?: string
  chartData: AssessmentReportChartData[]
}

const CHART_COLORS = ["#2563eb", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e"]

export default function ChartSection({ chartType, chartData }: ChartSectionProps) {
  const normalizedType = (chartType || "").toLowerCase()
  const showsPieChart = normalizedType.includes("pie")
  const showsHistogram = normalizedType.includes("histogram")

  if (chartData.length === 0) return null

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {(showsPieChart || !showsHistogram) && (
        <Card className="p-4 border border-border">
          <h4 className="font-semibold text-foreground mb-3">Sub-category Distribution (Pie)</h4>
          <ChartContainer
            className="h-[280px] w-full"
            config={{
              score: {
                label: "Score",
                color: "#2563eb",
              },
            }}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie data={chartData} dataKey="sub_category_score" nameKey="sub_category" outerRadius={95}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </Card>
      )}

      {(showsHistogram || !showsPieChart) && (
        <Card className="p-4 border border-border">
          <h4 className="font-semibold text-foreground mb-3">Sub-category Scores (Bar)</h4>
          <ChartContainer
            className="h-[280px] w-full"
            config={{
              sub_category_score: {
                label: "Score",
                color: "#14b8a6",
              },
            }}
          >
            <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="sub_category" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sub_category_score" fill="var(--color-sub_category_score)" radius={6} />
            </BarChart>
          </ChartContainer>
        </Card>
      )}
    </div>
  )
}
