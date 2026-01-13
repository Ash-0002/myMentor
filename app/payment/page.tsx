"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2, AlertCircle } from "lucide-react"

interface Test {
  id: number
  evaluation_code: string
  evaluation_name: string
  evaluation_fullname: string
  evaluation_cost: number
  evaluation_time: number
}

const processPayment = async (tests: Test[], amount: number): Promise<boolean> => {
  // TODO: Replace with actual payment API call
  // const response = await fetch('/api/payments/process', {
  //   method: 'POST',
  //   body: JSON.stringify({ testIds: tests.map(t => t.id), amount })
  // })
  // return response.ok

  // Simulate payment processing
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 2000)
  })
}

export default function PaymentPage() {
  const router = useRouter()
  const [selectedTests, setSelectedTests] = useState<Test[]>([])
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedTests = localStorage.getItem("selectedTests")
    const storedAmount = localStorage.getItem("paymentAmount")

    if (storedTests && storedAmount) {
      try {
        const tests = JSON.parse(storedTests)
        const amount = Number.parseFloat(storedAmount)
        setSelectedTests(tests)
        setPaymentAmount(amount)
        setIsLoading(false)
      } catch (error) {
        console.log("[v0] Error loading payment data", error)
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const success = await processPayment(selectedTests, paymentAmount)

      if (success) {
        setPaymentStatus("success")
        localStorage.setItem("paymentStatus", "completed")
        localStorage.setItem("paymentDate", new Date().toISOString())

        // Save the full test objects so they can be rendered in the assessment list
        localStorage.setItem("paidTests", JSON.stringify(selectedTests))

        setTimeout(() => {
          router.push("/assessments")
        }, 1500)
      } else {
        setPaymentStatus("failed")
      }
    } catch (error) {
      console.log("[v0] Payment error", error)
      setPaymentStatus("failed")
    }
    setIsProcessing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 border border-border">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-foreground font-semibold">Loading payment details...</p>
        </Card>
      </div>
    )
  }

  if (selectedTests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="p-8 border border-border max-w-sm mx-4">
          <AlertCircle className="w-8 h-8 text-yellow-500 mb-4" />
          <p className="text-foreground font-semibold">No tests found</p>
          <p className="text-sm text-muted-foreground mt-2">Please select tests first</p>
          <Button onClick={() => router.push("/")} className="mt-4 w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Secure Payment</h1>
          <p className="text-muted-foreground">Complete your payment to start the assessment</p>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card shadow-lg mb-6">
          {paymentStatus === "success" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment has been processed. Redirecting to your assessments...
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            </div>
          ) : paymentStatus === "failed" ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">Please try again or contact support</p>
              <Button
                onClick={() => {
                  setPaymentStatus("pending")
                  setIsProcessing(false)
                }}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 pb-8 border-b border-input">
                <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {selectedTests.map((test) => (
                    <div key={test.id} className="flex justify-between items-center">
                      <span className="text-sm text-foreground font-medium">{test.evaluation_name}</span>
                      <span className="text-sm text-foreground font-semibold">₹{test.evaluation_cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8 pb-8 border-b border-input space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">₹{Math.round(paymentAmount * 0.847)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="text-foreground font-medium">₹{Math.round(paymentAmount * 0.847 * 0.18)}</span>
                </div>
              </div>

              <div className="mb-8 flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total Amount</span>
                <span className="text-3xl font-bold text-primary">₹{paymentAmount.toLocaleString()}</span>
              </div>

              <div className="mb-8 space-y-3">
                <h3 className="font-semibold text-foreground mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {["Credit/Debit Card", "UPI", "Net Banking", "Wallet"].map((method) => (
                    <button
                      key={method}
                      className="p-4 border-2 border-input rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-foreground"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Payment"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Your payment information is secure and encrypted. This is a demo payment flow.
              </p>
            </>
          )}
        </Card>

        {paymentStatus === "pending" && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Billing
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
