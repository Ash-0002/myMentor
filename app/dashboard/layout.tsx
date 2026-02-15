"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Check for authentication
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    
    if (!isLoggedIn) {
      router.push("/login")
    } else {
      setAuthorized(true)
    }
  }, [router])

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          {/* <p className="text-muted-foreground animate-pulse">Checking access...</p> */}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
