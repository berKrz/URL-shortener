export interface ValidationErrors {
  longUrl:    string | null
  customSlug: string | null
}

export function validateLongUrl(url: string): string | null {
  if (!url.trim())
    return 'url is required'
  // URL regex
  if (!/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi.test(url.trim()))
    return 'invalid url'
  return null
}

export function validateCustomSlug(slug: string): string | null {
  if (!slug.trim())
    return 'slug is required'

  if (slug.trim().length < 7)
    return 'slug length must be 7 minimum'
  
  if (slug.trim().length > 15)
    return 'slug length must be 15 maximum'
  
  if (!/^[a-zA-Z0-9]+$/.test(slug.trim()))
    return 'special characters are not allowed'
  return null
}

export function validate(
  longUrl: string,
  mode: 'auto' | 'custom',
  customSlug: string,
): ValidationErrors {
  return {
    longUrl:    validateLongUrl(longUrl),
    customSlug: mode === 'custom' ? validateCustomSlug(customSlug) : null,
  }
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.values(errors).some(e => e !== null)
}