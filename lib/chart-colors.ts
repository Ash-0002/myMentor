export const CHART_COLORS = ["#2563eb", "#14b8a6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e"]

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}
