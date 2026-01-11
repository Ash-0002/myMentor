"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface Test {
  id: number
  evaluation_code: string
  evaluation_name: string
  evaluation_fullname: string
  evaluation_cost: number
}

interface BillingPanelProps {
  selectedTests?: Test[]
}

export default function BillingPanel({ selectedTests = [] }: BillingPanelProps) {
  const router = useRouter()
  const [tests, setTests] = useState<Test[]>(selectedTests)

  useEffect(() => {
    setTests(selectedTests)
  }, [selectedTests])

  const subtotal = tests.reduce((sum, test) => sum + test.evaluation_cost, 0)
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + tax

  const handlePayment = () => {
    localStorage.setItem("selectedTests", JSON.stringify(tests))
    localStorage.setItem("paymentAmount", total.toString())
    router.push("/payment")
  }

  return (
    <Card className="p-4 md:p-6 border border-border bg-gradient-to-b from-card to-card/50 md:sticky md:top-24">
      <div className="mb-6">
        <Badge variant="secondary" className="bg-accent/10 text-accent border-0">
          Billing Summary
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Selected Tests */}
        <div className="space-y-2">
          {tests.length > 0 ? (
            tests.map((test) => (
              <div key={test.id} className="flex justify-between items-center text-sm">
                <span className="text-foreground font-medium">{test.evaluation_name}</span>
                <span className="text-foreground font-bold">₹ {test.evaluation_cost.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground italic">No tests selected</p>
          )}
        </div>

        <div className="h-px bg-border my-4" />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground font-medium">₹ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Tax (18%)</span>
            <span className="text-foreground font-medium">₹ {tax.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-px bg-border my-4" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-xl md:text-2xl font-bold text-primary">₹ {total.toLocaleString()}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-8 pt-4 border-t border-border">
          <Button
            onClick={handlePayment}
            disabled={tests.length === 0}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50"
          >
            Proceed to Payment
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="border-border text-foreground hover:bg-muted bg-transparent">
              Reset
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
