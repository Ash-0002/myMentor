"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    gender: "",
    date_of_birth: "",
    mobile: "",
    email: "",
    address: "",
    password: "",
    confirm_password: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      router.push("/dashboard")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!formData.first_name || !formData.email || !formData.password || !formData.mobile) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => data.append(key, value))
      data.append("role_id", "3")

      const { registerPatient } = await import("@/lib/auth-service")
      const response = await registerPatient(data)

      if (response.message === "patient created successfully") {
        localStorage.setItem("isLoggedIn", "true")
        router.push("/dashboard")
      } else {
        setError(response.message || "Registration failed")
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        <Card className="p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary-foreground">+</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground text-sm">Register as a patient to get started</p>
          </div>

          {error && (
            <div className="p-3 mb-6 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Personal Details */}
            <div>
              <h3 className="font-semibold text-base border-b pb-2 mb-4">Personal Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />
                </div>

              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="font-semibold text-base border-b pb-2 mb-4">Contact Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mobile *</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none" />
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="font-semibold text-base border-b pb-2 mb-4">Security</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Login here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
