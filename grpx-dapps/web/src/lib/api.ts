// lib/api.ts

import { BASE_API_URL, defaultHeaders } from './constants'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export type BodyType = object | string | FormData | Blob | ArrayBufferView | URLSearchParams | null

export type FetchOptions = {
  method?: HttpMethod
  headers?: HeadersInit
  body?: BodyType
}

export type ApiResponse<T> = {
  success: boolean
  data: T
}

async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body } = options
  const response = await fetch(`${BASE_API_URL}/${endpoint}`, {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: 'include',
    body: body ? JSON.stringify(body) : null,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Something went wrong')
  }

  return response.json()
}

export default api
