const VITE_API_URL = import.meta.env.VITE_API_URL

export interface ShortenRequest {
  original_url: string
  custom_url?:  string
  force?:       boolean
}

export interface ShortenResponse {
  short_url: string
}

// Returned in the 409 body when the URL was already shortened
export interface DuplicateResponse {
  existing_short_url: string
  message:            string
}

// Laravel returns validation errors in this shape (422)
export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}

// Wraps all API errors so callers get a consistent shape
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Thrown specifically on 409 — carries the existing short URL
export class DuplicateUrlError extends Error {
  constructor(public readonly existingShortUrl: string) {
    super('this URL has already been shortened.')
    this.name = 'DuplicateUrlError'
  }
}

// Core fetch wrapper — handles all non-2xx responses uniformly
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${VITE_API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      ...options,
    })
  } catch {
    // fetch() itself threw — network is down, CORS failure, DNS error, etc.
    throw new ApiError(0, 'Network Error')
  }

  if (response.ok) {
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  // --- Error responses ---
  if (response.status === 409) {
    const body: DuplicateResponse = await response.json()
    throw new DuplicateUrlError(body.existing_short_url)
  }

  if (response.status === 422) {
    const body: ValidationError = await response.json()
    throw new ApiError(422, body.message, body.errors)
  }

  if (response.status === 404) {
    throw new ApiError(404, 'Short URL not found.')
  }

  // Catch-all for 500, 503, etc.
  throw new ApiError(response.status, `unexpected error (${response.status})`)
}

// POST /api/shorten
// Shortens a URL, optionally with a custom code.
// Pass force: true to bypass the duplicate check and always create a new entry.
export async function shortenUrl(payload: ShortenRequest): Promise<ShortenResponse> {
  return request<ShortenResponse>('/shorten', {
    method: 'POST',
    body:   JSON.stringify(payload),
  })
}