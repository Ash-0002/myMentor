"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"

interface Test {
  id: number
  evaluation_code: string
  evaluation_name: string
  evaluation_fullname: string
  evaluation_cost: number
  evaluation_time: number
}

export default function BillingPage() {
  const router = useRouter()
  const [selectedTests, setSelectedTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("selectedTests")
    if (stored) {
      try {
        setSelectedTests(JSON.parse(stored))
      } catch (error) {
        console.error("[v0] Error loading tests:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const subtotal = selectedTests.reduce((sum, test) => sum + test.evaluation_cost, 0)
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax
  const totalDuration = selectedTests.reduce((sum, test) => sum + test.evaluation_time, 0)

  const handleProceedToPayment = () => {
    localStorage.setItem("paymentAmount", total.toString())
    router.push("/payment")
  }

  const handleEditTests = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (selectedTests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <Card className="p-8 border border-border max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Tests Selected</h2>
          <p className="text-sm text-muted-foreground mb-6">Please select tests before proceeding to billing.</p>
          <Button onClick={() => router.push("/")} className="w-full">
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Billing Summary</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Selected Tests */}
          <div className="md:col-span-2">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-4">Selected Tests</h2>
              <div className="space-y-3">
                {selectedTests.map((test, index) => (
                  <div
                    key={test.id}
                    className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-input"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{index + 1}.</span>
                        <p className="font-semibold text-foreground">{test.evaluation_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{test.evaluation_fullname}</p>
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{test.evaluation_time}m</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {test.evaluation_code}
                        </Badge>
                      </div>
                    </div>
                    <p className="font-bold text-primary text-lg">₹{test.evaluation_cost.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Billing Summary */}
          <Card className="p-6 border border-border h-fit sticky top-20">
            <h3 className="text-lg font-bold text-foreground mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6 pb-6 border-b border-input">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tests Selected</span>
                <span className="font-semibold text-foreground">{selectedTests.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Duration</span>
                <span className="font-semibold text-foreground">{totalDuration}m</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b border-input">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tax (18%)</span>
                <span className="text-foreground font-medium">₹{tax.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
            </div>

            <div className="space-y-3">
              <Button onClick={handleProceedToPayment} className="w-full bg-primary hover:bg-primary/90">
                Proceed to Payment
              </Button>
              <Button onClick={handleEditTests} variant="outline" className="w-full bg-transparent">
                Edit Test Selection
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
