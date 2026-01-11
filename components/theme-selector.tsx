"use client"

import { useState, useEffect } from "react"
import { Palette } from "lucide-react"

const themes = {
  default: {
    name: "Professional Purple",
    primary: "oklch(0.52 0.15 280)",
    accent: "oklch(0.55 0.18 25)",
    sidebarPrimary: "oklch(0.52 0.15 280)",
    description: "Modern purple with warm orange accents",
  },
  ocean: {
    name: "Ocean Blue",
    primary: "oklch(0.52 0.15 220)",
    accent: "oklch(0.65 0.15 180)",
    sidebarPrimary: "oklch(0.52 0.15 220)",
    description: "Cool blues and teals for calm interface",
  },
  emerald: {
    name: "Emerald Green",
    primary: "oklch(0.55 0.15 150)",
    accent: "oklch(0.60 0.12 40)",
    sidebarPrimary: "oklch(0.55 0.15 150)",
    description: "Fresh green with warm gold accents",
  },
  sunset: {
    name: "Sunset Red",
    primary: "oklch(0.60 0.18 30)",
    accent: "oklch(0.65 0.15 200)",
    sidebarPrimary: "oklch(0.60 0.18 30)",
    description: "Warm red-orange with cool blue accents",
  },
  midnight: {
    name: "Midnight Indigo",
    primary: "oklch(0.45 0.15 260)",
    accent: "oklch(0.70 0.15 100)",
    sidebarPrimary: "oklch(0.45 0.15 260)",
    description: "Deep indigo with bright lime accents",
  },
  rose: {
    name: "Rose Pink",
    primary: "oklch(0.58 0.16 320)",
    accent: "oklch(0.60 0.12 180)",
    sidebarPrimary: "oklch(0.58 0.16 320)",
    description: "Elegant rose with cool slate accents",
  },
}

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState("default")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("selectedTheme") || "default"
    setCurrentTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (themeName: string) => {
    const theme = themes[themeName as keyof typeof themes]
    if (!theme) return

    const root = document.documentElement
    root.style.setProperty("--primary", theme.primary)
    root.style.setProperty("--accent", theme.accent)
    root.style.setProperty("--sidebar-primary", theme.sidebarPrimary)

    // Update dark mode colors proportionally
    if (root.classList.contains("dark")) {
      const primaryLightness = Number.parseFloat(theme.primary.split(" ")[0]) + 0.1
      const accentLightness = Number.parseFloat(theme.accent.split(" ")[0]) + 0.1
      const sidebarLightness = Number.parseFloat(theme.sidebarPrimary.split(" ")[0]) + 0.1
      root.style.setProperty(
        "--primary",
        `oklch(${primaryLightness} ${theme.primary.split(" ")[1]} ${theme.primary.split(" ")[2]})`,
      )
      root.style.setProperty(
        "--accent",
        `oklch(${accentLightness} ${theme.accent.split(" ")[1]} ${theme.accent.split(" ")[2]})`,
      )
      root.style.setProperty(
        "--sidebar-primary",
        `oklch(${sidebarLightness} ${theme.sidebarPrimary.split(" ")[1]} ${theme.sidebarPrimary.split(" ")[2]})`,
      )
    }

    localStorage.setItem("selectedTheme", themeName)
  }

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName)
    applyTheme(themeName)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        aria-label="Theme selector"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">{themes[currentTheme as keyof typeof themes].name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-background border border-border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Choose a Theme</p>
          </div>
          <div className="max-h-96 overflow-y-auto p-4 space-y-2">
            {Object.entries(themes).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => handleThemeChange(key)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  currentTheme === key
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.accent }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
