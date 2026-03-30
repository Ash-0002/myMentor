export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data?: {
    patient_detail?: Record<string, unknown>;
    hospital_detail?: Record<string, unknown>;
    role?: number | string;
  };
  error?: string;
}

export const USER_ROLE = {
  HOSPITAL_ADMIN: { id: "5", name: "hospital admin" },
  INDIVIDUAL_PATIENT: { id: "3", name: "individual patient" },
  HOSPITAL_PATIENT: { id: "4", name: "hospital patient" },
} as const;

type RegistrationRoleId = (typeof USER_ROLE)[keyof typeof USER_ROLE]["id"];

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
  const source = errorData?.message ?? errorData?.error ?? errorData?.detail ?? errorData;
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
  roleId: RegistrationRoleId,
): FormData {
  const roleNameById: Record<RegistrationRoleId, string> = {
    [USER_ROLE.HOSPITAL_ADMIN.id]: USER_ROLE.HOSPITAL_ADMIN.name,
    [USER_ROLE.INDIVIDUAL_PATIENT.id]: USER_ROLE.INDIVIDUAL_PATIENT.name,
    [USER_ROLE.HOSPITAL_PATIENT.id]: USER_ROLE.HOSPITAL_PATIENT.name,
  };
  const roleName = roleNameById[roleId];
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

  data.set("role_id", roleId);
  data.set("role", roleName);

  if (!data.get("country_id")) {
    data.set("country_id", "1");
  }

  return data;
}

export async function loginUser(credentials: LoginCredentials): Promise<any> {
  const response = await fetch('/api/external/user-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(getApiErrorMessage(errorData, "Login failed"));
  }

  const userResponse = await response.json();

  // Get tokens
  const tokenResponse = await fetch('/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.username,
      password: credentials.password
    }),
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    throw new Error(getApiErrorMessage(errorData, "Failed to retrieve access tokens"));
  }

  const tokens = await tokenResponse.json();
  
  return {
    ...userResponse,
    tokens
  };
} 

export async function registerPatient(formData: FormData): Promise<any> {
  const response = await fetch("/api/external/patient/create", {
    method: "POST",
    body: formData,
  });

  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(getApiErrorMessage(responseData, "Registration failed"));
  }

  return responseData;
}
