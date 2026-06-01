import { NextResponse } from "next/server"
import axios from "axios"
import { buildBackendApiUrl, getBackendHeaders } from "@/lib/backend-api"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const patient_id = body?.patient_id

    if (!patient_id || typeof patient_id !== "string") {
      return NextResponse.json(
        { detail: [{ type: "missing", loc: ["body", "patient_id"], msg: "Field required" }] },
        { status: 400 },
      )
    }

    const response = await axios.request({
      method: "GET",
      url: buildBackendApiUrl("/user/details"),
      headers: getBackendHeaders({ "Content-Type": "application/json" }),
      data: { patient_id },
    })

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }
    console.error("[api/user/details] Error:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Failed to fetch user details" },
      { status: 500 },
    )
  }
}
