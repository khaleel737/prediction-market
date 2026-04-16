import { SettingsRepository } from '@/lib/db/queries/settings'

const GENERAL_SETTINGS_GROUP = 'general'

export const GEO_BLOCKING_ENABLED_KEY = 'geo_blocking_enabled'
export const GEO_BLOCKED_COUNTRIES_KEY = 'geo_blocked_countries'
export const GEO_BLOCKING_MESSAGE_KEY = 'geo_blocking_message'
export const GEO_BLOCKING_CUSTOM_HEADER_KEY = 'geo_blocking_custom_header'
export const MAX_GEO_BLOCKING_MESSAGE_LENGTH = 500
export const MAX_GEO_BLOCKING_CUSTOM_HEADER_LENGTH = 120

type SettingsGroup = Record<string, { value: string, updated_at: string }>
interface SettingsMap {
  [group: string]: SettingsGroup | undefined
}

export interface GeoBlockingSettings {
  enabled: boolean
  blockedCountries: string[]
  message: string
  customGeoHeader: string
}

interface GeoBlockingValidationResult {
  data: {
    enabledValue: string
    blockedCountriesValue: string
    messageValue: string
    customGeoHeaderValue: string
  } | null
  error: string | null
}

function normalizeStringValue(value: string | null | undefined) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseBlockedCountries(rawValue: string | null | undefined) {
  const normalized = normalizeStringValue(rawValue)
  if (!normalized) {
    return { value: [] as string[], error: null as string | null }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(normalized)
  }
  catch {
    return { value: [] as string[], error: 'Blocked countries must be valid JSON.' }
  }

  if (!Array.isArray(parsed)) {
    return { value: [] as string[], error: 'Blocked countries must be a list.' }
  }

  const ISO_COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/
  const deduped: string[] = []
  const seen = new Set<string>()

  for (const entry of parsed) {
    if (typeof entry !== 'string' || !ISO_COUNTRY_CODE_PATTERN.test(entry)) {
      return { value: [] as string[], error: 'Blocked countries contain an invalid country code.' }
    }

    if (seen.has(entry)) {
      continue
    }

    seen.add(entry)
    deduped.push(entry)
  }

  return { value: deduped, error: null as string | null }
}

function isValidHeaderName(value: string) {
  return /^[A-Z][\w-]*$/i.test(value)
}

export function getGeoBlockingSettingsFromSettings(settings?: SettingsMap): GeoBlockingSettings {
  const enabled = normalizeStringValue(settings?.[GENERAL_SETTINGS_GROUP]?.[GEO_BLOCKING_ENABLED_KEY]?.value) === 'true'
  const message = normalizeStringValue(settings?.[GENERAL_SETTINGS_GROUP]?.[GEO_BLOCKING_MESSAGE_KEY]?.value)
  const customGeoHeader = normalizeStringValue(settings?.[GENERAL_SETTINGS_GROUP]?.[GEO_BLOCKING_CUSTOM_HEADER_KEY]?.value)
  const blockedCountriesParsed = parseBlockedCountries(
    settings?.[GENERAL_SETTINGS_GROUP]?.[GEO_BLOCKED_COUNTRIES_KEY]?.value,
  )

  return {
    enabled,
    blockedCountries: blockedCountriesParsed.value,
    message,
    customGeoHeader,
  }
}

export async function loadGeoBlockingSettings(): Promise<GeoBlockingSettings> {
  const { data } = await SettingsRepository.getSettings()
  return getGeoBlockingSettingsFromSettings(data ?? undefined)
}

export function validateGeoBlockingInput(params: {
  enabled: string | null | undefined
  blockedCountriesJson: string | null | undefined
  message: string | null | undefined
  customGeoHeader: string | null | undefined
}): GeoBlockingValidationResult {
  const enabledValue = normalizeStringValue(params.enabled) === 'true' ? 'true' : 'false'
  const messageValue = normalizeStringValue(params.message)
  const customGeoHeaderValue = normalizeStringValue(params.customGeoHeader)
  const blockedCountriesParsed = parseBlockedCountries(params.blockedCountriesJson)

  if (messageValue.length > MAX_GEO_BLOCKING_MESSAGE_LENGTH) {
    return {
      data: null,
      error: `Geo-blocking message must be ${MAX_GEO_BLOCKING_MESSAGE_LENGTH} characters or less.`,
    }
  }

  if (customGeoHeaderValue.length > MAX_GEO_BLOCKING_CUSTOM_HEADER_LENGTH) {
    return {
      data: null,
      error: `Custom geo header must be ${MAX_GEO_BLOCKING_CUSTOM_HEADER_LENGTH} characters or less.`,
    }
  }

  if (customGeoHeaderValue && !isValidHeaderName(customGeoHeaderValue)) {
    return { data: null, error: 'Custom geo header must be a valid HTTP header name.' }
  }

  if (blockedCountriesParsed.error) {
    return { data: null, error: blockedCountriesParsed.error }
  }

  return {
    data: {
      enabledValue,
      blockedCountriesValue: JSON.stringify(blockedCountriesParsed.value),
      messageValue,
      customGeoHeaderValue,
    },
    error: null,
  }
}
