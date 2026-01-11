"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronDown, Pill, Loader2, X, AlertCircle } from "lucide-react"

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

export default function TestSelection({ onTestsChange }: { onTestsChange?: (tests: Test[]) => void }) {
  const [selectedTests, setSelectedTests] = useState<Test[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [testsByCategory, setTestsByCategory] = useState<Record<number, Test[]>>({})
  const [expandedCategories, setExpandedCategories] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState<Record<number, boolean>>({})
  const [selectedTestDetail, setSelectedTestDetail] = useState<Test | null>(null)
  const [error, setError] = useState<string | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const apiClient = axios.create({
    baseURL: "/api",
    timeout: 10000,
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null)
        console.log("[v0] Fetching categories from proxy...")
        const response = await apiClient.get("/categories/")
        console.log("[v0] Categories response:", response.data)

        if (response.data?.status === "success" && Array.isArray(response.data.data)) {
          const validCategories = response.data.data.filter((c: Category) => c.category !== "nan")
          setCategories(validCategories)
          console.log("[v0] Categories loaded:", validCategories.length)

          // Automatically expand the first valid category
          if (validCategories.length > 0) {
            handleToggleCategory(validCategories[0].id)
          }
        } else if (response.data?.status === "error") {
          setError(`API Error: ${response.data.message}`)
          console.error("[v0] API returned error:", response.data)
        } else {
          setError("Unexpected response format from server")
          console.error("[v0] Unexpected categories format", response.data)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error"
        setError(`Failed to load categories: ${errorMsg}`)
        console.error("[v0] Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleToggleCategory = async (categoryId: number) => {
    const isExpanded = expandedCategories.includes(categoryId)

    if (!isExpanded) {
      setExpandedCategories((prev) => [...prev, categoryId])

      if (!testsByCategory[categoryId]) {
        setLoadingCategories((prev) => ({ ...prev, [categoryId]: true }))
        try {
          console.log(`[v0] Fetching tests for category ${categoryId}...`)
          const response = await apiClient.get(`/tests/${categoryId}/`)
          console.log(`[v0] Tests response for category ${categoryId}:`, response.data)

          if (response.data?.status === "success" && Array.isArray(response.data.data)) {
            setTestsByCategory((prev) => ({ ...prev, [categoryId]: response.data.data }))
            console.log(`[v0] Tests loaded for category ${categoryId}:`, response.data.data.length)
          } else if (response.data?.status === "error") {
            console.error(`[v0] API error for category ${categoryId}:`, response.data)
          } else {
            console.error(`[v0] Unexpected tests format for category ${categoryId}`, response.data)
          }
        } catch (error) {
          console.error(`[v0] Error fetching tests for category ${categoryId}:`, error)
        } finally {
          setLoadingCategories((prev) => ({ ...prev, [categoryId]: false }))
        }
      }
    } else {
      setExpandedCategories((prev) => prev.filter((id) => id !== categoryId))
    }
  }

  const toggleTest = (test: Test) => {
    setSelectedTests((prev) => {
      const isSelected = prev.some((t) => t.id === test.id)
      const next = isSelected ? prev.filter((t) => t.id !== test.id) : [...prev, test]
      onTestsChange?.(next)
      return next
    })
  }

  const getFilteredTests = () => {
    if (!searchQuery.trim()) return testsByCategory

    const filtered: Record<number, Test[]> = {}
    Object.entries(testsByCategory).forEach(([catId, tests]) => {
      const categoryTests = tests.filter(
        (test) =>
          test.evaluation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.evaluation_fullname.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      if (categoryTests.length > 0) {
        filtered[Number(catId)] = categoryTests
      }
    })
    return filtered
  }

  const filteredTests = getFilteredTests()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="space-y-4">
      <Card className="p-6 border border-border bg-card">
        <div className="mb-6">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
            Test Selection
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Select Assessment Tests</label>

            {/* Searchable Combobox */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between px-4 py-3 border border-input bg-background rounded-lg cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={isLoading ? "Loading categories..." : "Search tests by name..."}
                  disabled={isLoading}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setIsOpen(true)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(true)
                  }}
                  className="flex-1 outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                />
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                )}
              </div>

              {/* Dropdown with categorized tests */}
              {isOpen && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-lg shadow-lg z-50 max-h-[70vh] flex flex-col">
                  <div className="sticky top-0 px-4 py-3 border-b border-input bg-muted/30 flex items-center gap-2 z-10">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      {categories.length} categories available
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {categories.map((category) => {
                      const tests = filteredTests[category.id] || []
                      const isExpanded = expandedCategories.includes(category.id)
                      const isLoadingTests = loadingCategories[category.id]

                      if (searchQuery.trim() && tests.length === 0) return null

                      return (
                        <div key={category.id} className="border-b border-input last:border-b-0">
                          {/* Category Header */}
                          <button
                            onClick={() => handleToggleCategory(category.id)}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between sticky top-0 bg-background z-5"
                          >
                            <div className="flex items-center gap-2">
                              <Pill className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold text-foreground">{category.category}</span>
                              {isLoadingTests ? (
                                <Loader2 className="w-3 h-3 text-primary animate-spin" />
                              ) : testsByCategory[category.id] ? (
                                <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
                                  {testsByCategory[category.id].length}
                                </Badge>
                              ) : null}
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Category Tests */}
                          {isExpanded && (
                            <div className="bg-muted/20 divide-y divide-input">
                              {isLoadingTests ? (
                                <div className="px-8 py-4 flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Loading tests...
                                </div>
                              ) : tests.length > 0 ? (
                                tests.map((test) => (
                                  <label
                                    key={test.id}
                                    className="flex items-center gap-3 px-8 py-4 hover:bg-muted/50 cursor-pointer transition-colors group"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedTests.some((t) => t.id === test.id)}
                                      onChange={() => {
                                        toggleTest(test)
                                        setSelectedTestDetail(test)
                                      }}
                                      className="w-4 h-4 rounded border-input text-primary cursor-pointer flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-sm text-foreground">{test.evaluation_name}</p>
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] py-0 px-1.5 flex-shrink-0 bg-primary/5 border-primary/20 uppercase"
                                        >
                                          {test.evaluation_code}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground truncate mb-1">
                                        {test.evaluation_fullname}
                                      </p>
                                      <p className="text-xs text-muted-foreground line-clamp-2">{test.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end flex-shrink-0">
                                      <p className="font-bold text-sm text-primary">
                                        ₹{test.evaluation_cost.toLocaleString()}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{test.evaluation_time}m</p>
                                    </div>
                                  </label>
                                ))
                              ) : (
                                <div className="px-8 py-4 text-sm text-muted-foreground">
                                  No tests found in this category
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs font-semibold text-primary mb-3">
                Selected Tests ({selectedTests.length}) • ₹
                {selectedTests.reduce((sum, t) => sum + t.evaluation_cost, 0).toLocaleString()} Total
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
        </div>
      </Card>

      {selectedTestDetail && (
        <Card className="p-6 border border-border bg-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground">{selectedTestDetail.evaluation_fullname}</h3>
              <p className="text-sm text-muted-foreground mt-1">Code: {selectedTestDetail.evaluation_code}</p>
            </div>
            <button
              onClick={() => setSelectedTestDetail(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{selectedTestDetail.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Duration</p>
                <p className="text-lg font-bold text-foreground">{selectedTestDetail.evaluation_time}m</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Cost</p>
                <p className="text-lg font-bold text-primary">₹{selectedTestDetail.evaluation_cost.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Min Age</p>
                <p className="text-sm font-semibold text-foreground">{selectedTestDetail.min_age} years</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Max Age</p>
                <p className="text-sm font-semibold text-foreground">{selectedTestDetail.max_age} years</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-6 border border-red-500 bg-red-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-semibold text-red-500">{error}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
