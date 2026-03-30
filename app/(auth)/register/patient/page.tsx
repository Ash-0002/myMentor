"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { buildRegistrationFormData, registerPatient, USER_ROLE } from "@/lib/auth-service"

interface Hospital {
  id: string
  hospital_name: string
}

export default function PatientRegisterPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    gender: "",
    age: "",
    date_of_birth: "",
    phone: "",
    email: "",
    address: "",
    password: "",
    confirm_password: "",
  })
  const [patientType, setPatientType] = useState<"individual patient" | "hospital patient">("individual patient")
  const [selectedHospitalId, setSelectedHospitalId] = useState("")
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false)
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

  useEffect(() => {
    if (patientType !== "hospital patient") return
    if (hospitals.length > 0) return

    const loadHospitals = async () => {
      setIsLoadingHospitals(true)
      try {
        const response = await fetch("/api/external/hospitals")
        const json = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(json?.message || "Failed to load hospitals")
        }

        const hospitalList = Array.isArray(json?.data) ? json.data : []
        setHospitals(
          hospitalList
            .filter((hospital: any) => typeof hospital?.id === "string" && typeof hospital?.hospital_name === "string")
            .map((hospital: any) => ({ id: hospital.id, hospital_name: hospital.hospital_name })),
        )
      } catch (err: any) {
        setError(err.message || "Unable to load hospital list")
      } finally {
        setIsLoadingHospitals(false)
      }
    }

    loadHospitals()
  }, [patientType, hospitals.length])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (
      !formData.first_name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.username ||
      !formData.gender ||
      !formData.age
    ) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    if (patientType === "hospital patient" && !selectedHospitalId) {
      setError("Please select a hospital")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const roleId = patientType === "hospital patient" ? USER_ROLE.HOSPITAL_PATIENT.id : USER_ROLE.INDIVIDUAL_PATIENT.id
      const payload = {
        ...formData,
        ...(patientType === "hospital patient" ? { hospital_id: selectedHospitalId } : {}),
      }
      const data = buildRegistrationFormData(payload, roleId)
      const response = await registerPatient(data)

      if (response.message?.toLowerCase().includes("success")) {
        router.push("/login")
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Clean Navigation Bar */}
      <nav className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                <span className="text-sm font-bold text-primary-foreground">+</span>
              </div>
              <span className="text-lg font-bold">MyMentor</span>
            </Link>
            <div className="h-4 w-[1px] bg-border hidden sm:block" />
            <Link 
              href="/register" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium border-l border-border pl-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
          <Link href="/login">
             <Button variant="ghost" size="sm" className="font-semibold text-primary">Sign In</Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent py-14">
        <div className="w-full max-w-2xl">
          <Card className="p-10 border-border/50 shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-xl">
            <div className="space-y-2 mb-10 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Patient Registration</h1>
              <p className="text-muted-foreground text-sm">Create your personal health profile</p>
            </div>

            {error && (
              <div className="p-4 mb-8 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Registration Type</span>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Patient Type *</label>
                    <select
                      name="patient_type"
                      value={patientType}
                      onChange={(e) => {
                        const value = e.target.value as "individual patient" | "hospital patient"
                        setPatientType(value)
                        setSelectedHospitalId("")
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                      required
                    >
                      <option value="individual patient">Individual Patient</option>
                      <option value="hospital patient">Hospital Patient</option>
                    </select>
                  </div>

                  {patientType === "hospital patient" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground ml-1">Hospital Name *</label>
                      <select
                        name="hospital_id"
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                        required
                        disabled={isLoadingHospitals}
                      >
                        <option value="">{isLoadingHospitals ? "Loading hospitals..." : "Select Hospital"}</option>
                        {hospitals.map((hospital) => (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.hospital_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Personal Details</span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">First Name *</label>
                    <input type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Last Name</label>
                    <input type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Username *</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" required>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Age *</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} min={1}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Date of Birth</label>
                    <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Contact Details</span>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium" required />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium resize-none shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Security</span>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Password *</label>
                    <div className="relative group">
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground ml-1">Confirm Password *</label>
                    <div className="relative group">
                      <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleChange}
                        className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium pr-10" required />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? "Processing..." : "Create Patient Account"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
