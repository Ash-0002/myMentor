export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data?: {
    user_id: number;
    name: string;
    user_name: string;
    user_type: string;
  };
  error?: string;
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
    throw new Error(errorData.message || 'Login failed');
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
    // If token fetch fails, we should probably still throw an error 
    // or handle it gracefully. For now, failing the login seems appropriate.
    const errorData = await tokenResponse.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to retrieve access tokens');
  }

  const tokens = await tokenResponse.json();
  
  return {
    ...userResponse,
    tokens
  };
} 

export async function registerPatient(formData: FormData): Promise<any> {
  console.log('--- verify registerPatient called ---');
  console.log('Target URL: /api/external/patient/create');

  // calculate age from dob if not present or just pass what we have
  // The API expects specific fields. We will rely on the formData passed from the component.
  
  const response = await fetch('/api/external/patient/create', {
    method: 'POST',
    body: formData, 
    // Content-Type header is automatically set for FormData with boundary
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
}
