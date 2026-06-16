import React from "react"
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import { formatDescriptorText, getPatientDisplayName, type AssessmentReport } from "@/lib/assessment-report"

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
})

export function AssessmentReportPdf({
  assessmentId,
  report,
  generatedAt,
  pieChartImage,
  histogramImage,
}: AssessmentReportPdfProps) {
  const categories = report.test_chart_data ?? []
  const insightRows =
    report.sub_category_result.length > 0
      ? report.sub_category_result
      : categories.map((item) => ({
          sub_category: item.sub_category,
          sub_category_score: item.sub_category_score,
          sub_category_descriptor: item.sub_category_descriptor,
        }))

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
          const descriptorText =
            item.sub_category_descriptor
              ?.map((entry) => formatDescriptorText(entry.test_descriptor))
              .filter(Boolean)
              .join("\n\n") || "No descriptor available"
          return (
            <View key={`${item.sub_category || "category"}-${index}`} style={styles.insightCard}>
              <Text style={styles.subTitle}>
                {(item.sub_category || "Unnamed Category").trim()} (Score:{" "}
                {Number(item.sub_category_score || 0).toFixed(2)})
              </Text>
              <Text style={styles.textRow}>{descriptorText}</Text>
              {"sub_category_questions" in item && item.sub_category_questions?.length ? (
                <View style={{ marginTop: 4 }}>
                  {item.sub_category_questions.map((question, qIndex) => (
                    <Text key={`${question.question_id}-${qIndex}`} style={[styles.textRow, styles.mutedText]}>
                      Q: {question.question} | A:{" "}
                      {item.sub_category_selected_option?.[qIndex]?.selected_option || "Not available"}
                    </Text>
                  ))}
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
