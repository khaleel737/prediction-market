import { describe, expect, it } from 'vitest'
import {
  getGeoBlockingSettingsFromSettings,
  validateGeoBlockingInput,
} from '@/lib/geo-blocking-settings'

describe('geoBlockingSettings', () => {
  describe('getGeoBlockingSettingsFromSettings', () => {
    it('returns defaults when settings are empty', () => {
      const result = getGeoBlockingSettingsFromSettings(undefined)

      expect(result.enabled).toBe(false)
      expect(result.blockedCountries).toEqual([])
      expect(result.message).toBe('')
      expect(result.customGeoHeader).toBe('')
    })

    it('parses enabled state and blocked countries from settings', () => {
      const result = getGeoBlockingSettingsFromSettings({
        general: {
          geo_blocking_enabled: { value: 'true', updated_at: '' },
          geo_blocked_countries: { value: '["US","CN","RU"]', updated_at: '' },
          geo_blocking_message: { value: 'Not available here', updated_at: '' },
          geo_blocking_custom_header: { value: 'CF-IPCountry', updated_at: '' },
        },
      })

      expect(result.enabled).toBe(true)
      expect(result.blockedCountries).toEqual(['US', 'CN', 'RU'])
      expect(result.message).toBe('Not available here')
      expect(result.customGeoHeader).toBe('CF-IPCountry')
    })

    it('handles invalid JSON in blocked countries gracefully', () => {
      const result = getGeoBlockingSettingsFromSettings({
        general: {
          geo_blocked_countries: { value: 'not-json', updated_at: '' },
        },
      })

      expect(result.blockedCountries).toEqual([])
    })

    it('deduplicates blocked countries', () => {
      const result = getGeoBlockingSettingsFromSettings({
        general: {
          geo_blocked_countries: { value: '["US","US","CN"]', updated_at: '' },
        },
      })

      expect(result.blockedCountries).toEqual(['US', 'CN'])
    })
  })

  describe('validateGeoBlockingInput', () => {
    it('validates valid input', () => {
      const result = validateGeoBlockingInput({
        enabled: 'true',
        blockedCountriesJson: '["US","DE"]',
        message: 'Blocked',
        customGeoHeader: 'X-Country',
      })

      expect(result.error).toBeNull()
      expect(result.data).not.toBeNull()
      expect(result.data!.enabledValue).toBe('true')
      expect(result.data!.blockedCountriesValue).toBe('["US","DE"]')
      expect(result.data!.messageValue).toBe('Blocked')
      expect(result.data!.customGeoHeaderValue).toBe('X-Country')
    })

    it('normalizes enabled to false for non-true values', () => {
      const result = validateGeoBlockingInput({
        enabled: 'false',
        blockedCountriesJson: '[]',
        message: '',
        customGeoHeader: '',
      })

      expect(result.data!.enabledValue).toBe('false')
    })

    it('rejects message exceeding max length', () => {
      const result = validateGeoBlockingInput({
        enabled: 'true',
        blockedCountriesJson: '[]',
        message: 'a'.repeat(501),
        customGeoHeader: '',
      })

      expect(result.error).toContain('500 characters')
      expect(result.data).toBeNull()
    })

    it('rejects invalid header names', () => {
      const result = validateGeoBlockingInput({
        enabled: 'true',
        blockedCountriesJson: '[]',
        message: '',
        customGeoHeader: 'invalid header!',
      })

      expect(result.error).toContain('valid HTTP header name')
      expect(result.data).toBeNull()
    })

    it('accepts valid header names', () => {
      const validHeaders = ['X-Vercel-IP-Country', 'CF-IPCountry', 'CloudFront-Viewer-Country', 'X_Custom_Header']
      for (const header of validHeaders) {
        const result = validateGeoBlockingInput({
          enabled: 'true',
          blockedCountriesJson: '[]',
          message: '',
          customGeoHeader: header,
        })
        expect(result.error).toBeNull()
      }
    })

    it('rejects invalid country codes', () => {
      const result = validateGeoBlockingInput({
        enabled: 'true',
        blockedCountriesJson: '["US","invalid"]',
        message: '',
        customGeoHeader: '',
      })

      expect(result.error).toContain('invalid country code')
      expect(result.data).toBeNull()
    })

    it('accepts empty blocked countries', () => {
      const result = validateGeoBlockingInput({
        enabled: 'true',
        blockedCountriesJson: '[]',
        message: '',
        customGeoHeader: '',
      })

      expect(result.error).toBeNull()
      expect(result.data!.blockedCountriesValue).toBe('[]')
    })

    it('handles null and undefined inputs', () => {
      const result = validateGeoBlockingInput({
        enabled: null,
        blockedCountriesJson: undefined,
        message: null,
        customGeoHeader: undefined,
      })

      expect(result.error).toBeNull()
      expect(result.data!.enabledValue).toBe('false')
      expect(result.data!.blockedCountriesValue).toBe('[]')
      expect(result.data!.messageValue).toBe('')
      expect(result.data!.customGeoHeaderValue).toBe('')
    })
  })
})
