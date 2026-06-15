import { apiFetch } from "@/lib/backend-api"

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface PatientRegistrationPayload {
  first_name: string;
  last_name?: string;
  username: string;
  role_id: number;
  gender: string;
  age: number;
  country_id: number;
  phone: string;
  email: string;
  address?: string;
  password: string;
  confirm_password: string;
  hospital_id?: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data?: {
    patient_detail?: Record<string, unknown>;
    hospital_detail?: Record<string, unknown>;
    role_detail?: { id: number; name: string };
  };
  access_token?: string;
}

export const USER_ROLE = {
  INDIVIDUAL_PATIENT: { id: 1, code: "IP", name: "Individual Patient" },
  HOSPITAL_PATIENT: { id: 2, code: "HP", name: "Hospital Patient" },
  HOSPITAL_ADMIN: { id: 3, code: "HA", name: "Hospital Admin" },
} as const;

export interface HospitalAdminRegistrationPayload {
  tenant_name: string;
  first_name: string;
  last_name?: string;
  username: string;
  phone: string;
  email: string;
  hospital_name: string;
  hospital_address: string;
  hospital_phone: string;
  hospital_email: string;
  doctor_name: string;
  password: string;
  confirm_password: string;
  country_id: number;
}

function flattenApiError(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    return [prefix ? `${prefix}: ${value}` : value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenApiError(item, prefix));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
      flattenApiError(nested, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [];
}

function getApiErrorMessage(errorData: any, fallback: string): string {
  const detail = errorData?.detail;
  if (detail && typeof detail === "object" && typeof detail.message === "string") {
    return detail.message;
  }
  if (typeof detail === "string") {
    return detail;
  }

  const source = errorData?.message ?? errorData?.error ?? errorData;
  const messages = flattenApiError(source).filter(Boolean);
  return messages.length > 0 ? messages.join(" | ") : fallback;
}

function calculateAge(dateOfBirth: string): string {
  if (!dateOfBirth) return "";

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age > 0 ? String(age) : "";
}

export function buildRegistrationFormData(
  payload: Record<string, string | File | null | undefined>,
  roleId: number,
): FormData {
  const data = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    data.append(key, value);
  });

  const dateOfBirth = String(payload.date_of_birth ?? "");
  const existingAge = String(payload.age ?? "");
  const resolvedAge = existingAge || calculateAge(dateOfBirth);

  if (resolvedAge) {
    data.set("age", resolvedAge);
  }

  data.set("role_id", String(roleId));
  data.set("role", String(roleId));

  if (!data.get("country_id")) {
    data.set("country_id", "1");
  }

  return data;
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch("/api/external/user-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseData, "Invalid username or password"));
  }

  return responseData as LoginResponse;
} 

export async function registerPatient(formData: FormData): Promise<any> {
  const response = await apiFetch("/api/external/patient/create", {
    method: "POST",
    body: formData,
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseData, "Registration failed"));
  }

  return responseData;
}

export async function registerHospitalAdminJson(payload: HospitalAdminRegistrationPayload): Promise<any> {
  const response = await apiFetch("/api/external/hospital/admin/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseData, "Admin registration failed"));
  }

  return responseData;
}

export async function registerPatientJson(payload: PatientRegistrationPayload): Promise<any> {
  const response = await apiFetch("/api/external/patient/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseData, "Registration failed"));
  }

  return responseData;
}
