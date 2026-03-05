import { ref }                   from 'vue'
import { defineStore }           from 'pinia'
import { validate, hasErrors }   from '@/lib/validation'
import { shortenUrl, ApiError }  from '@/lib/api'
import type { ValidationErrors } from '@/lib/validation'

export interface HistoryEntry {
  originalUrl: string
  shortUrl:    string
  mode:        'auto' | 'custom'
  createdAt:   string
}

export const useUrlStore = defineStore('url', () => {
  const history      = ref<HistoryEntry[]>([])
  const errors       = ref<ValidationErrors>({ longUrl: null, customSlug: null })
  const errorMessage = ref<string | null>(null)

  async function shorten(
    longUrl:    string,
    mode:       'auto' | 'custom',
    customSlug: string,
  ): Promise<string | null> {
    errors.value       = validate(longUrl, mode, customSlug)
    errorMessage.value = null
    if (hasErrors(errors.value)) return null

    try {
      const response = await shortenUrl({
        original_url: longUrl.trim(),
        custom_url:   mode === 'custom' ? customSlug.trim() : undefined,
      })

      const shortUrl = `${import.meta.env.VITE_API_URL}/${response.short_url}`

      history.value.push({
        originalUrl: longUrl.trim(),
        shortUrl,
        mode,
        createdAt: new Date().toISOString(),
      })

      return shortUrl

    } catch (e) {
      if (e instanceof ApiError && e.status === 422 && e.errors) {
        errors.value = {
          longUrl:    e.errors.original_url?.[0] ?? null,
          customSlug: e.errors.custom_url?.[0]   ?? null,
        }
      } else {
        errorMessage.value = e instanceof ApiError ? e.message : 'Unexpected error'
      }
      return null
    }
  }

  function clearFieldError(field: keyof ValidationErrors) {
    errors.value[field] = null
  }

  return { history, errors, errorMessage, shorten, clearFieldError }

}, {
  persist: { pick: ['history'] },
})