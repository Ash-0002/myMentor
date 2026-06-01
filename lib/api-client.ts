import axios from "axios"
import { API_TENANT_HEADERS } from "@/lib/backend-api"

/** Axios client with x-tenant header for all backend/proxy API calls */
export const apiClient = axios.create({
  headers: API_TENANT_HEADERS,
})
