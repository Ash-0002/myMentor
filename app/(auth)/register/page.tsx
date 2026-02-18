"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ShieldCheck, User, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterSelectPage() {
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      router.push("/dashboard");
    }
  }, [router]);

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
        <div className="w-full max-w-2xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-2 text-primary animate-in zoom-in-50 duration-500">
              <Plus className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Join MyMentor</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Select your account type to begin your journey with our advanced assessment system.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <Link href="/register/admin" className="group">
              <Card className="p-10 border border-border/50 group-hover:border-primary/50 transition-all duration-300 h-full flex flex-col items-center text-center space-y-6 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden bg-card/80 backdrop-blur-sm">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Admin</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Access tools for patient management, clinical assessments, and detailed reporting.
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/register/patient" className="group">
              <Card className="p-10 border border-border/50 group-hover:border-primary/50 transition-all duration-300 h-full flex flex-col items-center text-center space-y-6 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden bg-card/80 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                  <User className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Patient</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Register to take assessments, track your progress, and view your records.
                  </p>
                </div>
              </Card>
            </Link>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-bold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
