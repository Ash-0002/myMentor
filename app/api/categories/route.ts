import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Proxy: Fetching categories from backend...")

    const response = await fetch("http://31.97.63.174:9010/api/categories", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log("[v0] Proxy: Raw response length:", responseText.length)
    console.log("[v0] Proxy: Response status:", response.status)
    console.log("[v0] Proxy: Response headers:", Object.fromEntries(response.headers.entries()))

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("[v0] Proxy: Failed to parse JSON. Response starts with:", responseText.substring(0, 200))
      return NextResponse.json(
        { status: "error", message: "Backend returned invalid JSON", raw: responseText.substring(0, 100) },
        { status: 500 },
      )
    }

    if (!response.ok) {
      console.error("[v0] Proxy: Backend error:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("[v0] Proxy: Successfully fetched categories")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Proxy: Categories Error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Connection failed" },
      { status: 500 },
    )
  }
}
