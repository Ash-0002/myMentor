// Replace these with actual API calls when backend is ready

export interface AssessmentQuestion {
  id: number
  question: string
  options: string[]
  correct_answer: number
}

export interface TestAssessment {
  testId: number
  testName: string
  totalQuestions: number
  duration: number
  questions: AssessmentQuestion[]
}

export const getTestAssessment = async (testId: number): Promise<TestAssessment | null> => {
  // TODO: Replace with API call
  // const response = await fetch(`/api/assessments/${testId}`)
  // return response.json()

  // For now, return mock data stored in assessment/page.tsx assessmentData
  return null
}

export const submitAssessment = async (testId: number, answers: Record<number, number>, totalQuestions: number) => {
  // TODO: Replace with API call
  // const response = await fetch('/api/assessments/submit', {
  //   method: 'POST',
  //   body: JSON.stringify({ testId, answers, totalQuestions })
  // })
  // return response.json()

  return null
}
