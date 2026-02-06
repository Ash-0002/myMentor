import { ArrowRight, CheckCircle, Shield, Clock, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HospitalDashboard from "@/components/hospital-dashboard"

export default function Home() {
  return (
    
        <main className="min-h-screen bg-background">
          <HospitalDashboard />
        </main>
      
    // <div className="min-h-screen bg-background">
    //   {/* Navigation */}
    //   <nav className="sticky top-0 bg-card/80 backdrop-blur border-b border-border z-50">
    //     <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
    //       <div className="flex items-center gap-3">
    //         <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
    //           <span className="text-lg font-bold text-primary-foreground">+</span>
    //         </div>
    //         <span className="text-xl font-bold text-foreground hidden sm:inline">MediCare</span>
    //       </div>
    //       <div className="flex items-center gap-4">
    //         <Link href="/login">
    //           <Button variant="outline">Login</Button>
    //         </Link>
    //         <Link href="/register">
    //           <Button>Register</Button>
    //         </Link>
    //       </div>
    //     </div>
    //   </nav>

    //   {/* Hero Section */}
    //   <section className="max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-32">
    //     <div className="text-center space-y-6 mb-12">
    //       <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
    //         Advanced Patient Assessment System
    //       </h1>
    //       <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto text-balance">
    //         Comprehensive evaluation and diagnostic tools for healthcare professionals. Streamline assessments, manage
    //         patient data, and generate detailed reports.
    //       </p>
    //       <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
    //         <Link href="/register">
    //           <Button size="lg" className="w-full sm:w-auto">
    //             Get Started <ArrowRight className="ml-2 w-4 h-4" />
    //           </Button>
    //         </Link>
    //         <Link href="/login">
    //           <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
    //             Sign In
    //           </Button>
    //         </Link>
    //       </div>
    //     </div>

    //     {/* Features Grid */}
    //     <div className="grid md:grid-cols-4 gap-6 py-12">
    //       {[
    //         { icon: Clock, title: "Fast Assessment", desc: "Complete evaluations in minutes" },
    //         { icon: Shield, title: "Secure & HIPAA", desc: "Protected patient data" },
    //         { icon: Users, title: "Multi-User", desc: "Collaborate with your team" },
    //         { icon: CheckCircle, title: "Detailed Reports", desc: "Comprehensive analysis" },
    //       ].map((feature, i) => (
    //         <div key={i} className="p-6 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
    //           <feature.icon className="w-8 h-8 text-primary mb-3" />
    //           <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
    //           <p className="text-sm text-muted-foreground">{feature.desc}</p>
    //         </div>
    //       ))}
    //     </div>
    //   </section>

    //   {/* Footer */}
    //   <footer className="border-t border-border bg-muted/30 py-8">
    //     <div className="max-w-7xl mx-auto px-4 md:px-6 text-center text-muted-foreground">
    //       <p>&copy; 2025 MediCare Hospital. All rights reserved.</p>
    //     </div>
    //   </footer>
    // </div>
  )
}
