"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import TestSelection from "@/components/test-selection"
import { isIndividualDashboardUser } from "@/lib/dashboard-user"

interface Test {
  id: number
  evaluation_code: string
  evaluation_name: string
  evaluation_fullname: string
  evaluation_cost: number
  evaluation_time: number
}

export default function PatientBillingView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedTests, setSelectedTests] = useState<Test[]>([])
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [isLoadingPaymentData, setIsLoadingPaymentData] = useState(true)
  const [patientId, setPatientId] = useState("")

  const step = searchParams.get("step")
  const isPaymentStep = step === "payment"

  const { subtotal, tax, total, totalDuration } = useMemo(() => {
    const computedSubtotal = selectedTests.reduce((sum, test) => sum + test.evaluation_cost, 0)
    const computedTax = Math.round(computedSubtotal * 0.18)
    return {
      subtotal: computedSubtotal,
      tax: computedTax,
      total: computedSubtotal + computedTax,
      totalDuration: selectedTests.reduce((sum, test) => sum + test.evaluation_time, 0),
    }
  }, [selectedTests])

  useEffect(() => {
    const storedTests = localStorage.getItem("selectedTests")
    if (storedTests) {
      try {
        const parsed = JSON.parse(storedTests)
        if (Array.isArray(parsed)) {
          setSelectedTests(parsed)
        }
      } catch {
        // ignore malformed selected tests data
      }
    }
  }, [])

  useEffect(() => {
    if (!isPaymentStep) {
      setIsLoadingPaymentData(false)
      return
    }

    const storedTests = localStorage.getItem("selectedTests")
    const storedAmount = localStorage.getItem("paymentAmount")
    const storedUser = localStorage.getItem("user")

    if (storedTests && storedAmount) {
      try {
        const tests = JSON.parse(storedTests)
        const amount = Number.parseFloat(storedAmount)
        if (Array.isArray(tests)) {
          setSelectedTests(tests)
        }
        setPaymentAmount(Number.isFinite(amount) ? amount : 0)
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          if (isIndividualDashboardUser(parsedUser)) {
            setPatientId(parsedUser.patient_id)
          }
        }
      } catch {
        // ignore malformed payment data
      }
    }

    setIsLoadingPaymentData(false)
  }, [isPaymentStep])

  const handleProceedToPayment = () => {
    if (selectedTests.length === 0) return
    localStorage.setItem("selectedTests", JSON.stringify(selectedTests))
    localStorage.setItem("paymentAmount", total.toString())
    router.push("/dashboard?view=billing&step=payment")
  }

  const handleCompletePayment = async () => {
    if (!patientId) {
      setPaymentStatus("failed")
      return
    }

    setIsProcessing(true)
    try {
      const testsToCreate = [...selectedTests]

      await new Promise((resolve) => setTimeout(resolve, 2000))
      setPaymentStatus("success")
      localStorage.setItem("paymentStatus", "completed")
      localStorage.setItem("paymentDate", new Date().toISOString())
      localStorage.setItem("paidTests", JSON.stringify(testsToCreate))
      localStorage.removeItem("selectedTests")
      localStorage.removeItem("paymentAmount")

      try {
        // Intentionally omit x-tenant for assessment/create (apiFetch always adds it)
        const createResponse = await fetch("/api/external/assessment/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "x-tenant": API_TENANT_ID,
          },
          body: JSON.stringify({
            test_ids: testsToCreate.map((test) => test.id),
            patient_ids: [patientId],
          }),
        })

        if (!createResponse.ok) {
          const errorBody = await createResponse.json().catch(() => ({}))
          console.error("[billing] assessment/create failed:", errorBody)
        }
      } catch (createError) {
        console.error("[billing] assessment/create error:", createError)
      }

      setTimeout(() => {
        router.replace("/dashboard?view=assessments")
      }, 1200)
    } catch {
      setPaymentStatus("failed")
    }
    setIsProcessing(false)
  }

  if (isPaymentStep) {
    if (isLoadingPaymentData) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="border border-border p-8">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="font-semibold text-foreground">Loading payment details...</p>
          </Card>
        </div>
      )
    }

    if (paymentStatus === "success") {
      return (
        <div className="mx-auto max-w-2xl">
          <Card className="border border-border bg-card p-8 shadow-lg md:p-12">
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">Payment Successful!</h3>
              <p className="mb-6 text-muted-foreground">Redirecting to My Assessments...</p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          </Card>
        </div>
      )
    }

    if (paymentStatus === "failed") {
      return (
        <div className="mx-auto max-w-2xl">
          <Card className="border border-border bg-card p-8 shadow-lg md:p-12">
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">Payment Failed</h3>
              <p className="mb-6 text-muted-foreground">
                {!patientId ? "Patient ID not found in session. Please login again." : "Please try again or contact support"}
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setPaymentStatus("pending")
                    setIsProcessing(false)
                  }}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard?view=billing")}
                  className="w-full"
                >
                  Back to Browse & Purchase
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    if (selectedTests.length === 0) {
      return (
        <div className="mx-auto max-w-sm">
          <Card className="border border-border p-8">
            <AlertCircle className="mb-4 h-8 w-8 text-yellow-500" />
            <p className="font-semibold text-foreground">No tests found</p>
            <p className="mt-2 text-sm text-muted-foreground">Please select tests first</p>
            <Button
              onClick={() => router.push("/dashboard?view=billing")}
              className="mt-4 w-full"
            >
              Back to Browse & Purchase
            </Button>
          </Card>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">Secure Payment</h2>
          <p className="text-muted-foreground">Complete your payment to start the assessment</p>
        </div>

        <Card className="mb-6 border border-border bg-card p-6 shadow-lg md:p-8">
          <>
            <div className="mb-8 border-b border-input pb-8">
                <h3 className="mb-4 font-semibold text-foreground">Order Summary</h3>
                <div className="space-y-3">
                  {selectedTests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{test.evaluation_name}</span>
                      <span className="text-sm font-semibold text-foreground">₹{test.evaluation_cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 space-y-3 border-b border-input pb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">₹{Math.round(paymentAmount * 0.847)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium text-foreground">₹{Math.round(paymentAmount * 0.847 * 0.18)}</span>
                </div>
              </div>

              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">Total Amount</span>
                <span className="text-3xl font-bold text-primary">₹{paymentAmount.toLocaleString()}</span>
              </div>

              <Button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="h-12 w-full gap-2 bg-primary text-base font-semibold hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Payment"
                )}
              </Button>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Your payment information is secure and encrypted. This is a demo payment flow.
              </p>
          </>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard?view=billing")}
            className="text-muted-foreground hover:text-foreground"
          >
            Back to Browse & Purchase
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Browse & Purchase</h2>
        <p className="text-sm text-slate-500">Select your tests and continue to payment.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <TestSelection onTestsChange={setSelectedTests} showProceedButton={false} />
        </div>

        <Card className="h-fit border border-border p-6 md:sticky md:top-20">
          <h3 className="mb-6 text-lg font-bold text-foreground">Order Summary</h3>

          <div className="mb-6 space-y-3 border-b border-input pb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tests Selected</span>
              <span className="font-semibold text-foreground">{selectedTests.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Duration</span>
              <span className="font-semibold text-foreground">{totalDuration}m</span>
            </div>
          </div>

          <div className="mb-6 space-y-3 border-b border-input pb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax (18%)</span>
              <span className="font-medium text-foreground">₹{tax.toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleProceedToPayment}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={selectedTests.length === 0}
            >
              Proceed to Payment
            </Button>
            {selectedTests.length === 0 && (
              <p className="text-center text-xs text-muted-foreground">Select at least one test to continue.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
