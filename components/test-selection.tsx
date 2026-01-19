"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, Loader2, X, AlertCircle, Info } from "lucide-react"
import { useRouter } from "next/navigation"

interface Category {
  id: number
  category: string
  created_at: string
}

interface Test {
  id: number
  evaluation_code: string
  evaluation_name: string
  evaluation_fullname: string
  purpose: string
  description: string
  evaluation_time: number
  min_age: number
  max_age: number
  evaluation_cost: number
  created_at: string
  category: number
}

interface TestDescriptionModalProps {
  test: Test | null
  onClose: () => void
}

function TestDescriptionModal({ test, onClose }: TestDescriptionModalProps) {
  if (!test) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="p-6 border border-border max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">{test.evaluation_fullname}</h3>
            <Badge variant="outline" className="text-xs mt-2">
              {test.evaluation_code}
            </Badge>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{test.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Duration</p>
              <p className="text-sm font-bold text-foreground">{test.evaluation_time}m</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Cost</p>
              <p className="text-sm font-bold text-primary">₹{test.evaluation_cost.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Min Age</p>
              <p className="text-sm font-bold text-foreground">{test.min_age}y</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Max Age</p>
              <p className="text-sm font-bold text-foreground">{test.max_age}y</p>
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-6">
          Close
        </Button>
      </Card>
    </div>
  )
}

export default function TestSelection({ onTestsChange }: { onTestsChange?: (tests: Test[]) => void }) {
  const router = useRouter()
  const [selectedTests, setSelectedTests] = useState<Test[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isLoadingTests, setIsLoadingTests] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTestDetail, setSelectedTestDetail] = useState<Test | null>(null)

  const apiClient = axios.create({
    baseURL: "/api",
    timeout: 10000,
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null)
        const response = await apiClient.get("/categories/", { timeout: 30000 })

        if (response.data?.status === "success" && Array.isArray(response.data.data)) {
          const validCategories = response.data.data.filter((c: Category) => c.category !== "nan")
          setCategories(validCategories)
        } else {
          setError("Failed to load categories")
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        setError(`Failed to load categories: ${errorMsg}`)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryChange = async (categoryId: number) => {
    setSelectedCategory(categoryId)
    setSelectedTests([])
    setTests([])
    setError(null)

    setIsLoadingTests(true)
    try {
      const response = await apiClient.get(`/tests/${categoryId}/`, { timeout: 30000 })

      if (response.data?.status === "success" && Array.isArray(response.data.data)) {
        setTests(response.data.data)
      } else {
        setError("Failed to load tests for this category")
        setTests([])
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      setError(`Failed to load tests: ${errorMsg}`)
      setTests([])
    } finally {
      setIsLoadingTests(false)
    }
  }

  const toggleTest = (test: Test) => {
    setSelectedTests((prev) => {
      const isSelected = prev.some((t) => t.id === test.id)
      const updated = isSelected ? prev.filter((t) => t.id !== test.id) : [...prev, test]
      onTestsChange?.(updated)
      return updated
    })
  }

  const totalDuration = selectedTests.reduce((sum, t) => sum + t.evaluation_time, 0)
  const totalCost = selectedTests.reduce((sum, t) => sum + t.evaluation_cost, 0)

  const handleProceedToBilling = () => {
    localStorage.setItem("selectedTests", JSON.stringify(selectedTests))
    localStorage.setItem("paymentAmount", totalCost.toString())
    router.push("/billing")
  }

  return (
    <Card className="p-6 border border-border bg-card">
      <div className="mb-6">
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
          Test Selection
        </Badge>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Category Selection */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">Step 1: Select Assessment Category</label>
          <div className="relative">
            <select
              value={selectedCategory || ""}
              onChange={(e) => handleCategoryChange(Number(e.target.value))}
              disabled={isLoadingCategories}
              className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{isLoadingCategories ? "Loading categories..." : "Choose a category..."}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Step 2: Tests List */}
        {selectedCategory && (
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">
              Step 2: Select Tests from {categories.find((c) => c.id === selectedCategory)?.category}
            </label>

            {isLoadingTests ? (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading tests...</span>
              </div>
            ) : tests.length > 0 ? (
              <div className="space-y-3 border border-input rounded-lg p-4 bg-muted/20">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-start gap-3 p-3 bg-background rounded-lg border border-input hover:border-primary transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTests.some((t) => t.id === test.id)}
                      onChange={() => toggleTest(test)}
                      className="w-4 h-4 rounded border-input text-primary cursor-pointer mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <p className="font-semibold text-sm text-foreground">{test.evaluation_name}</p>
                        <button
                          onClick={() => setSelectedTestDetail(test)}
                          className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                          title="View test details"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{test.evaluation_fullname}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 text-sm">
                      <p className="font-bold text-primary">₹{test.evaluation_cost.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{test.evaluation_time}m</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No tests available for this category</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Selected Tests Summary */}
        {selectedTests.length > 0 && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs font-semibold text-primary mb-3">
              Selected Tests ({selectedTests.length}) • {totalDuration} mins • ₹{totalCost.toLocaleString()} Total
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTests.map((test) => (
                <Badge
                  key={test.id}
                  variant="default"
                  className="bg-primary text-primary-foreground text-xs py-1 px-2 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                  onClick={() => toggleTest(test)}
                >
                  {test.evaluation_name}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {selectedCategory && (
          <Button
            onClick={handleProceedToBilling}
            disabled={selectedTests.length === 0}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            Proceed to Billing
          </Button>
        )}
      </div>

      {/* Test Description Modal */}
      <TestDescriptionModal test={selectedTestDetail} onClose={() => setSelectedTestDetail(null)} />
    </Card>
  )
}
