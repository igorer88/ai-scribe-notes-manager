import { Environment } from '@/config/enums'
import {
  DEFAULT_ALLOWED_ORIGINS,
  DEFAULT_MAX_AUDIO_UPLOAD_MB,
  parseAllowedOrigins,
  resolveMaxAudioUploadMb,
  resolveSwaggerEnabled
} from '@/config/environment/api.config'

describe('API config resolvers', () => {
  describe('parseAllowedOrigins', () => {
    it('returns the default origins when unset', () => {
      expect(parseAllowedOrigins(undefined)).toEqual([
        'http://localhost:5173',
        'http://localhost:3000'
      ])
      expect(parseAllowedOrigins(undefined).join(',')).toBe(
        DEFAULT_ALLOWED_ORIGINS
      )
    })

    it('splits, trims and drops empty values', () => {
      expect(parseAllowedOrigins(' https://a.test , https://b.test ,')).toEqual(
        ['https://a.test', 'https://b.test']
      )
    })
  })

  describe('resolveMaxAudioUploadMb', () => {
    it('falls back to the default when unset or invalid', () => {
      expect(resolveMaxAudioUploadMb(undefined)).toBe(
        DEFAULT_MAX_AUDIO_UPLOAD_MB
      )
      expect(resolveMaxAudioUploadMb('not-a-number')).toBe(
        DEFAULT_MAX_AUDIO_UPLOAD_MB
      )
      expect(resolveMaxAudioUploadMb('0')).toBe(DEFAULT_MAX_AUDIO_UPLOAD_MB)
    })

    it('parses a valid value', () => {
      expect(resolveMaxAudioUploadMb('25')).toBe(25)
    })
  })

  describe('resolveSwaggerEnabled', () => {
    it('is enabled by default only in development', () => {
      expect(resolveSwaggerEnabled(undefined, Environment.Development)).toBe(
        true
      )
      expect(resolveSwaggerEnabled(undefined, Environment.Staging)).toBe(false)
      expect(resolveSwaggerEnabled(undefined, Environment.Production)).toBe(
        false
      )
    })

    it('respects the explicit env override', () => {
      expect(resolveSwaggerEnabled('true', Environment.Staging)).toBe(true)
      expect(resolveSwaggerEnabled('false', Environment.Development)).toBe(
        false
      )
    })
  })
})
