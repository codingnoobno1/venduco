/**
 * VendorConnect API Client
 *
 * Centralized API client for the Next.js frontend.
 * All calls go to the Kotlin/Spring Boot backend.
 * Authentication is handled via HttpOnly cookies (set by the backend).
 */

const API_BASE = '/api/v1';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Endpoints that must never trigger a refresh-and-retry cycle.
const NO_REFRESH_ENDPOINTS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/logout'];

// One shared refresh call: every request that hits a 401 while a refresh is in flight
// awaits the same promise, then retries once (success) or fails cleanly (failure).
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = rawFetch('/auth/refresh', { method: 'POST' })
      .then(r => r.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

/** The refresh token is gone/expired: send users inside the dashboard back to /login. */
function handleSessionExpired() {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
}

function canRefresh(endpoint: string) {
  return !NO_REFRESH_ENDPOINTS.some(e => endpoint.includes(e));
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  let response = await rawFetch(endpoint, options);

  if (response.status === 401 && canRefresh(endpoint)) {
    if (await refreshSession()) {
      response = await rawFetch(endpoint, options); // retry exactly once
    } else {
      handleSessionExpired();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.message || `Request failed with status ${response.status}`,
      errorData
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function rawFetch(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;
  const config: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  return fetch(`${API_BASE}${endpoint}`, config);
}

/**
 * Drop-in replacement for `fetch` for call sites that need the raw Response.
 *
 * - Always sends the HttpOnly session cookies (credentials: 'include').
 * - Never forwards an Authorization header: tokens are not readable by JavaScript.
 * - Maps legacy `/api/<path>` URLs onto the Spring API at `/api/v1/<path>`.
 * - On 401, refreshes the session once and retries; redirects to /login if that fails.
 */
export async function secureFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const url = /^\/api\/(?!v1\/)/.test(input) ? input.replace(/^\/api\//, `${API_BASE}/`) : input;

  const headers = new Headers(init.headers);
  headers.delete('Authorization');
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!isFormData && init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const send = () => fetch(url, { ...init, headers, credentials: 'include' });

  let response = await send();
  if (response.status === 401 && canRefresh(url.replace(API_BASE, ''))) {
    if (await refreshSession()) {
      response = await send();
    } else {
      handleSessionExpired();
    }
  }
  return response;
}

// ==================== Auth API ====================

export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  message: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (email: string, fullName: string, password: string, role: string = 'VENDOR') =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: { email, fullName, password, role },
    }),

  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
};

// ==================== User API ====================

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export const userApi = {
  list: () => apiRequest<UserResponse[]>('/users'),
  getById: (id: string) => apiRequest<UserResponse>(`/users/${id}`),
  deactivate: (id: string) =>
    apiRequest<UserResponse>(`/users/${id}/deactivate`, { method: 'POST' }),
  activate: (id: string) =>
    apiRequest<UserResponse>(`/users/${id}/activate`, { method: 'POST' }),
};

// ==================== Tender API ====================

export interface TenderResponse {
  id: string;
  title: string;
  description: string;
  referenceNumber: string;
  projectId: string;
  status: string;
  estimatedValue: string;
  aiRiskScore: number | null;
  publishDate: string | null;
  closingDate: string | null;
}

export interface CreateTenderRequest {
  title: string;
  description: string;
  projectId: string;
  packageId?: string;
  estimatedValueAmount: number;
  estimatedValueCurrency?: string;
  closingDate: string;
}

export const tenderApi = {
  list: (status?: string, projectId?: string) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (projectId) params.set('projectId', projectId);
    const qs = params.toString();
    return apiRequest<TenderResponse[]>(`/tenders${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => apiRequest<TenderResponse>(`/tenders/${id}`),
  create: (data: CreateTenderRequest) =>
    apiRequest<TenderResponse>('/tenders', { method: 'POST', body: data }),
  publish: (id: string) =>
    apiRequest<TenderResponse>(`/tenders/${id}/publish`, { method: 'POST' }),
  analyze: (id: string) =>
    apiRequest<TenderResponse>(`/tenders/${id}/analyze`, { method: 'POST' }),
};

// ==================== Health API ====================

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  subsystems: Record<string, string>;
}

export const healthApi = {
  check: () => apiRequest<HealthResponse>('/health'),
};

export { ApiError };
export default apiRequest;
