/**
 * Centralized API Client
 * 
 * Provides a consistent interface for all API calls with:
 * - Automatic error handling
 * - Request/response interceptors
 * - Base URL configuration
 * - Credential management
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: any
  ) {
    super(data?.error || `API Error: ${status}`)
    this.name = 'ApiError'
  }
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  /**
   * Make a request to the API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Remove leading slash from endpoint if baseUrl already has it
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
    const url = `${cleanBaseUrl}/${cleanEndpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: response.statusText || `HTTP ${response.status}` }
        }
        throw new ApiError(response.status, errorData)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      // Network or other errors
      throw new ApiError(500, { 
        error: error instanceof Error ? error.message : 'Network error' 
      })
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * POST with FormData (for file uploads)
   */
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
    const url = `${cleanBaseUrl}/${cleanEndpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Don't set Content-Type header - browser will set it with boundary
        headers: {
          ...(options?.headers || {}),
        },
      })

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: response.statusText || `HTTP ${response.status}` }
        }
        throw new ApiError(response.status, errorData)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, { 
        error: error instanceof Error ? error.message : 'Network error' 
      })
    }
  }

  /**
   * PUT with FormData (for file uploads)
   */
  async putFormData<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestInit
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl
    const url = `${cleanBaseUrl}/${cleanEndpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        method: 'PUT',
        body: formData,
        credentials: 'include',
        headers: {
          ...(options?.headers || {}),
        },
      })

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: response.statusText || `HTTP ${response.status}` }
        }
        throw new ApiError(response.status, errorData)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(500, { 
        error: error instanceof Error ? error.message : 'Network error' 
      })
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()


