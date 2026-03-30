"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Eye, EyeOff, Home, LayoutDashboard } from "lucide-react"
import { loginUser } from "@/lib/auth-service"
import { normalizeDashboardUser } from "@/lib/dashboard-user"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      router.push("/dashboard")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = await loginUser({ username: email, password })

      if (data.data) {
        const normalizedUser = normalizeDashboardUser(data.data)
        if (!normalizedUser) {
          throw new Error("Invalid user details returned by login API")
        }
        localStorage.setItem("user", JSON.stringify(normalizedUser))
      }

      if (data.tokens) {
        localStorage.setItem("accessToken", data.tokens.access)
        localStorage.setItem("refreshToken", data.tokens.refresh)
        document.cookie = `auth_token=${data.tokens.access}; path=/; max-age=86400; SameSite=Strict`
        document.cookie = `session=active; path=/; max-age=86400; SameSite=Strict`
      }

      localStorage.setItem("isLoggedIn", "true")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Clean Navigation Bar */}
      <nav className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
              <span className="text-sm font-bold text-primary-foreground">+</span>
            </div>
            <span className="text-lg font-bold">MyMentor</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Portal</span>
            </Button>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
        <div className="w-full max-w-md">
          <Card className="p-10 border-border/50 shadow-2xl shadow-primary/5 bg-card/80 backdrop-blur-xl">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Sign In</h1>
              <p className="text-muted-foreground text-sm">Access your MyMentor dashboard</p>
            </div>

            {error && (
              <div className="p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground ml-1">Username / Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-medium pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? "Signing in..." : "Dashboard Login"}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-semibold">
                  Join now
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
