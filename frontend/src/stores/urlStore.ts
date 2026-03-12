import { ref }                                     from 'vue'
import { defineStore }                             from 'pinia'
import { validate, hasErrors }                     from '@/lib/validation'
import { shortenUrl, ApiError, DuplicateUrlError } from '@/lib/api'
import type { ValidationErrors }                   from '@/lib/validation'

export interface HistoryEntry {
  originalUrl: string
  shortUrl:    string
  mode:        'auto' | 'custom'
  createdAt:   string
}

export type ShortenResult =
  | { status: 'ok';        shortUrl: string }
  | { status: 'duplicate'; existingShortUrl: string }
  | { status: 'error' }

export const useUrlStore = defineStore('url', () => {
  const history      = ref<HistoryEntry[]>([])
  const errors       = ref<ValidationErrors>({ longUrl: null, customSlug: null })
  const errorMessage = ref<string | null>(null)

  async function shorten(
    longUrl:    string,
    mode:       'auto' | 'custom',
    customSlug: string,
    force       = false,
  ): Promise<ShortenResult> {
    errors.value       = validate(longUrl, mode, customSlug)
    errorMessage.value = null
    if (hasErrors(errors.value)) return { status: 'error' }

    try {
      const response = await shortenUrl({
        original_url: longUrl.trim(),
        custom_url:   mode === 'custom' ? customSlug.trim() : undefined,
        force,
      })

      const shortUrl = `${import.meta.env.VITE_API_URL}/${response.short_url}`

      history.value.push({
        originalUrl: longUrl.trim(),
        shortUrl,
        mode,
        createdAt: new Date().toISOString(),
      })

      return { status: 'ok', shortUrl }

    } catch (e) {
      if (e instanceof DuplicateUrlError) {
        const existingShortUrl = `${import.meta.env.VITE_API_URL}/${e.existingShortUrl}`
        return { status: 'duplicate', existingShortUrl }
      }

      if (e instanceof ApiError && e.status === 422 && e.errors) {
        errors.value = {
          longUrl:    e.errors.original_url?.[0] ?? null,
          customSlug: e.errors.custom_url?.[0]   ?? null,
        }
      } else {
        errorMessage.value = e instanceof ApiError ? e.message : 'unexpected error'
      }

      return { status: 'error' }
    }
  }

  // Moves an existing entry to the end of history (most recent position),
  // updating its createdAt timestamp. No-ops if the entry doesn't exist.
  function touchEntry(shortUrl: string, originalUrl: string) {
    const idx = history.value.findIndex(e => e.shortUrl === shortUrl)
    if (idx === -1) return 
    
    const entry = history.value.splice(idx, 1)[0]

    if (entry) {
      entry.createdAt = new Date().toISOString()
      history.value.push(entry)
    }
  }

  // Adds a new entry only if the shortUrl isn't already in history,
  // otherwise just moves the existing one to the end.
  function addOrTouchEntry(entry: Omit<HistoryEntry, 'createdAt'>) {
    const existing = history.value.find(e => e.shortUrl === entry.shortUrl)
    if (existing) {
      touchEntry(entry.shortUrl, entry.originalUrl)
    } else {
      history.value.push({ ...entry, createdAt: new Date().toISOString() })
    }
  }

  function clearFieldError(field: keyof ValidationErrors) {
    errors.value[field] = null
  }

  function removeEntry(shortUrl: string) {
    history.value = history.value.filter(e => e.shortUrl !== shortUrl)
  }

  function clearHistory() {
    history.value = []
  }

  return {
    history,
    errors,
    errorMessage,
    shorten,
    touchEntry,
    addOrTouchEntry,
    clearFieldError,
    removeEntry,
    clearHistory,
  }

}, {
  persist: { pick: ['history'] },
})