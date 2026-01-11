import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    console.log(`[v0] Proxy: Fetching tests for category ${id}...`)
    const response = await fetch(`http://31.97.63.174:9010/api/tests/${id}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()
    console.log(`[v0] Proxy: Response status for category ${id}:`, response.status)
    console.log(`[v0] Proxy: Response length for category ${id}:`, responseText.length)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error(
        `[v0] Proxy: Failed to parse JSON for category ${id}. Response starts with:`,
        responseText.substring(0, 200),
      )
      return NextResponse.json(
        { status: "error", message: "Backend returned invalid JSON", raw: responseText.substring(0, 100) },
        { status: 500 },
      )
    }

    if (!response.ok) {
      console.error(`[v0] Proxy: Backend error for category ${id}:`, data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log(`[v0] Proxy: Successfully fetched tests for category ${id}`)
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[v0] Proxy: Tests Error for ID ${id}:`, error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Connection failed" },
      { status: 500 },
    )
  }
}
