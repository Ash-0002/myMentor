"use client"

import type React from "react"

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
    city: "",
    state: "",
    country: "",
    pincode: "",
    blood_group: "",
    allergies: "",
    chronic_diseases: "",
    notes: "",
    password: "",
    confirm_password: "",
    referral_code: "",
    referred_by: "",
    hospital_name: "",
    doctor_name: "",
  })
  const [profilePic, setProfilePic] = useState<File | null>(null)
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0])
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Basic Validation
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
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      data.append('role_id', '3'); // Default role
      if (profilePic) {
        data.append('profile_pic', profilePic);
      }

      const response = await import('@/lib/auth-service').then(mod => mod.registerPatient(data));
      
      if (response.message === "patient created successfully") {
        localStorage.setItem("isLoggedIn", "true")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        setError(response.message || "Registration failed")
        setLoading(false) // Stop loading if we don't redirect
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.")
      setLoading(false)
    } finally {
      // We handle setLoading(false) in specific cases or let it stay true during redirect
      if (loading) setLoading(false) 
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
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

          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Personal Details</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Username</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                </div>
                 <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                </div>
                 <div>
                  <label className="block text-sm font-medium mb-1">Blood Group</label>
                  <input type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" placeholder="e.g. A+" />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Contact Details</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">Mobile *</label>
                  <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background resize-none" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                  </div>
                   <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-2">
                   <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                  </div>
                   <div>
                    <label className="block text-sm font-medium mb-1">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                  </div>
                </div>
              </div>

               {/* Medical & Meta Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Other Details</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Allergies</label>
                  <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Chronic Diseases</label>
                  <input type="text" name="chronic_diseases" value={formData.chronic_diseases} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" />
                </div>
                 <div>
                  <label className="block text-sm font-medium mb-1">Profile Picture</label>
                  <input type="file" onChange={handleFileChange} className="w-full px-3 py-2 rounded border bg-background text-sm" accept="image/*" />
                </div>
                
                <h4 className="font-medium pt-2">Hospital Info</h4>
                 <div className="grid grid-cols-2 gap-2">
                   <input type="text" name="hospital_name" value={formData.hospital_name} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" placeholder="Hospital Name" />
                   <input type="text" name="doctor_name" value={formData.doctor_name} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" placeholder="Doctor Name" />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                   <input type="text" name="referral_code" value={formData.referral_code} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" placeholder="Referral Code" />
                   <input type="text" name="referred_by" value={formData.referred_by} onChange={handleChange} className="w-full px-3 py-2 rounded border bg-background" placeholder="Referred By" />
                 </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-lg mb-4">Security</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                      required
                    />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                  </div>
                </div>
                 <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                      required
                    />
                     <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
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
