import React from "react"
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import {
  getPatientDisplayName,
  getSubCategoryDescriptorDisplay,
  getSubCategoryInsightItems,
  getSubCategoryMaxScore,
  type AssessmentReport,
} from "@/lib/assessment-report"
import {
  getScoreBarColorHex,
  getScoreLevel,
  getScoreLevelLabel,
  getScorePercent,
  getScoreTrackColorHex,
} from "@/lib/sub-category-score"

interface AssessmentReportPdfProps {
  assessmentId: string
  report: AssessmentReport
  generatedAt: string
  pieChartImage?: string | null
  histogramImage?: string | null
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 32,
    fontSize: 11,
    color: "#111827",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
    color: "#0f172a",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
    color: "#0f172a",
  },
  textRow: {
    marginBottom: 4,
    lineHeight: 1.4,
  },
  metricCardRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 8,
  },
  metricLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  chartImage: {
    width: "100%",
    height: 220,
    objectFit: "contain",
    marginTop: 4,
    marginBottom: 8,
  },
  insightCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  subTitle: {
    fontWeight: 700,
    marginBottom: 4,
  },
  mutedText: {
    color: "#6b7280",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    textAlign: "right",
    fontSize: 9,
    color: "#6b7280",
  },
  scoreBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 6,
  },
  scoreBarFill: {
    height: 10,
    borderRadius: 5,
  },
  scoreBarMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  scoreBarMetaText: {
    fontSize: 9,
    color: "#6b7280",
  },
})

function PdfSubCategoryScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const percent = getScorePercent(score, maxScore)
  const level = getScoreLevel(score, maxScore)

  return (
    <View>
      <View style={styles.scoreBarMeta}>
        <Text style={styles.scoreBarMetaText}>
          {score.toFixed(0)}/{maxScore}
        </Text>
        <Text style={styles.scoreBarMetaText}>
          {getScoreLevelLabel(level)} · {Math.round(percent)}%
        </Text>
      </View>
      <View style={[styles.scoreBarTrack, { backgroundColor: getScoreTrackColorHex(level) }]}>
        <View
          style={[
            styles.scoreBarFill,
            {
              width: `${percent}%`,
              backgroundColor: getScoreBarColorHex(level),
            },
          ]}
        />
      </View>
    </View>
  )
}

export function AssessmentReportPdf({
  assessmentId,
  report,
  generatedAt,
  pieChartImage,
  histogramImage,
}: AssessmentReportPdfProps) {
  const insightRows = getSubCategoryInsightItems(report)

  return (
    <Document title={`${report.test_name || "Assessment"} report`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.section}>
          <Text style={styles.title}>Assessment Report</Text>
          <Text style={styles.textRow}>Assessment ID: {assessmentId}</Text>
          <Text style={styles.textRow}>Generated on: {generatedAt}</Text>
        </View>

        <View style={styles.metricCardRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Patient</Text>
            <Text style={styles.metricValue}>{getPatientDisplayName(report)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Test</Text>
            <Text style={styles.metricValue}>{report.test_name || "N/A"}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Overall Score</Text>
            <Text style={styles.metricValue}>{Number(report.overall_score || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Details</Text>
          <Text style={styles.textRow}>Patient ID: {report.patient_data?.patient_id || "N/A"}</Text>
          {report.patient_data?.report_id ? <Text style={styles.textRow}>Report ID: {report.patient_data.report_id}</Text> : null}
          {report.patient_data?.email ? (
            <Text style={styles.textRow}>Email: {report.patient_data.email}</Text>
          ) : (
            <Text style={styles.textRow}>Username: {report.patient_data?.username || "N/A"}</Text>
          )}
          {report.patient_data?.organization ? (
            <Text style={styles.textRow}>Organization: {report.patient_data.organization}</Text>
          ) : null}
          {report.patient_data?.assessment_type ? (
            <Text style={styles.textRow}>Assessment Type: {report.patient_data.assessment_type}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interpretation</Text>
          <Text style={styles.textRow}>{report.interpretation || "Not available"}</Text>
        </View>

        {pieChartImage ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Sub-category Distribution (Pie)</Text>
            <Image src={pieChartImage} style={styles.chartImage} />
          </View>
        ) : null}

        {histogramImage ? (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Sub-category Score (Histogram)</Text>
            <Image src={histogramImage} style={styles.chartImage} />
          </View>
        ) : null}

        {insightRows.length > 0 ? <Text style={styles.sectionTitle}>Sub-category Insights</Text> : null}
        {insightRows.map((item, index) => {
          const score = Number(item.sub_category_score || 0)
          const maxScore = getSubCategoryMaxScore(item)
          const descriptors = getSubCategoryDescriptorDisplay(item.sub_category_descriptor)
          return (
            <View key={`${item.sub_category || "category"}-${index}`} style={styles.insightCard}>
              <Text style={styles.subTitle}>
                {(item.sub_category || "Unnamed Category").trim()} ({score.toFixed(0)}/{maxScore})
              </Text>
              <PdfSubCategoryScoreBar score={score} maxScore={maxScore} />
              {descriptors.length > 0 ? (
                <View style={{ marginTop: 4 }}>
                  {descriptors.map((descriptor, descriptorIdx) => (
                    <View key={`descriptor-${descriptorIdx}`} style={{ marginBottom: 6 }}>
                      {descriptor.label ? (
                        <Text style={[styles.textRow, { fontWeight: 700 }]}>{descriptor.label}</Text>
                      ) : null}
                      {descriptor.description ? (
                        <Text style={styles.textRow}>{descriptor.description}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}
              {item.sub_category_questions?.length ? (
                <View style={{ marginTop: 4 }}>
                  {item.sub_category_questions.map((question, qIndex) => {
                    const answer = item.sub_category_selected_option?.[qIndex]?.selected_option
                    return (
                      <Text key={`${question.question_id}-${qIndex}`} style={[styles.textRow, styles.mutedText]}>
                        Q: {question.question}
                        {answer ? ` | A: ${answer}` : ""}
                      </Text>
                    )
                  })}
                </View>
              ) : null}
            </View>
          )
        })}

        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  )
}
