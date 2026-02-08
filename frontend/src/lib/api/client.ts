/**
 * API Client - Base fetch wrapper for backend communication
 * Handles JSON serialization, credentials, and error responses
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, any>;
  };
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Generic API request with JSON handling and error parsing
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Required for cookies/auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) return null as T;

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      // Response body is empty or not JSON
      // For non-JSON responses, create a generic error
      if (!response.ok) {
        throw new ApiClientError(
          `HTTP Error: ${response.status}`,
          response.status,
          `HTTP_${response.status}`,
          'network'
        );
      }
    }

    if (!response.ok) {
      const apiError = data as ApiError;
      throw new ApiClientError(
        apiError?.error?.message || `HTTP Error: ${response.status}`,
        response.status,
        apiError?.error?.code || `HTTP_${response.status}`,
        apiError?.error?.field
      );
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiClientError) throw err;

    // Network or unexpected errors
    throw new ApiClientError('Unable to connect. Check your network.', 0, 'NETWORK_ERROR');
  }
}

/**
 * HTTP methods wrapper
 */
export const apiClient = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
  put: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};
