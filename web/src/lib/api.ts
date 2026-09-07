import { clearAccessToken, getAccessToken } from './token'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

function handleUnauthorized(response: Response): void {
  if (response.status === 401) {
    clearAccessToken()
    const { pathname } = window.location
    if (pathname !== '/login' && pathname !== '/register') {
      window.location.href = '/login'
    }
  }
}

async function parseError(response: Response): Promise<string> {
  if (response.status === 429) {
    return 'Too many attempts, please wait and try again'
  }

  try {
    const body = await response.json()
    const message = body?.message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  } catch {
    // fall through to the generic message
  }

  return `API Error: ${response.status} ${response.statusText}`
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentLength = response.headers.get('content-length')
  if (contentLength === '0' || response.status === 204) {
    return null as T
  }

  try {
    return (await response.json()) as T
  } catch {
    // If JSON parsing fails (empty response), return null
    return null as T
  }
}

export const api = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const headers = new Headers(options?.headers)
    if (!(options?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json')
    }

    const token = getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      handleUnauthorized(response)
      throw new Error(await parseError(response))
    }

    return parseResponse<T>(response)
  },

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData
    })
  }
}
