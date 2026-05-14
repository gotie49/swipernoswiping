// frontend/__tests__/utils.test.ts

import { getColorForType, getLabelForType, LOCATION_TYPES } from '../types/locationTypes'
import { geocodeAddress } from '../lib/geocoding'

// ─── nullString ──────────────────────────────────────────────────────────────
// Die Funktion ist in MapView.tsx als lokale Hilfsfunktion definiert. Hab hier rein kopiert, damit sie testbar ist, OHNE den ganzen
// Map-Komponenten Tree zu importieren (der würde maplibre-gl benötigen).
// Refactoring verbesserung (Iso.....): Man sollte maplibre in /frontend/lib/... importieren/auslagern? 

function nullString(val: unknown): string | null {
  if (val && typeof val === 'object' && 'String' in val && 'Valid' in val) {
    const v = val as { String: string; Valid: boolean }
    return v.Valid ? v.String : null
  }
  return typeof val === 'string' ? val : null
}

// ─── nullString Tests ─────────────────────────────────────────────────────────

describe('nullString', () => {
  test('gibt String zurück wenn Valid=true', () => {
    expect(nullString({ String: 'Hallo', Valid: true })).toBe('Hallo')
  })

  test('gibt null zurück wenn Valid=false', () => {
    expect(nullString({ String: 'Hallo', Valid: false })).toBeNull()
  })

  test('gibt leeren String zurück wenn Valid=true und String leer', () => {
    expect(nullString({ String: '', Valid: true })).toBe('')
  })

  test('gibt string direkt zurück wenn val ein normaler string ist', () => {
    expect(nullString('direkter string')).toBe('direkter string')
  })

  test('gibt null zurück für null', () => {
    expect(nullString(null)).toBeNull()
  })

  test('gibt null zurück für undefined', () => {
    expect(nullString(undefined)).toBeNull()
  })

  test('gibt null zurück für Zahl', () => {
    expect(nullString(42)).toBeNull()
  })

  test('gibt null zurück für Objekt ohne String/Valid Felder', () => {
    expect(nullString({ foo: 'bar' })).toBeNull()
  })
})

// ─── getColorForType Tests ────────────────────────────────────────────────────

describe('getColorForType', () => {
  test('gibt korrekten Farbwert für "cafe" zurück', () => {
    expect(getColorForType('cafe')).toBe('#F59E0B')
  })

  test('gibt korrekten Farbwert für "park" zurück', () => {
    expect(getColorForType('park')).toBe('#22C55E')
  })

  test('gibt korrekten Farbwert für "sports" zurück', () => {
    expect(getColorForType('sports')).toBe('#3B82F6')
  })

  test('gibt Fallback-Farbe für unbekannten Typ zurück', () => {
    expect(getColorForType('unbekannt')).toBe('#6B7280')
  })

  test('gibt Fallback-Farbe für leeren String zurück', () => {
    expect(getColorForType('')).toBe('#6B7280')
  })

  test('ist case-sensitive — "Cafe" ist nicht "cafe"', () => {
    expect(getColorForType('Cafe')).toBe('#6B7280')
  })

  test('alle definierten Typen haben einen gültigen Hex-Farbwert', () => {
    const hexColor = /^#[0-9A-Fa-f]{6}$/
    LOCATION_TYPES.forEach(({ key, color }) => {
      expect(getColorForType(key)).toBe(color)
      expect(color).toMatch(hexColor)
    })
  })
})

// ─── getLabelForType Tests ────────────────────────────────────────────────────

describe('getLabelForType', () => {
  test('gibt korrektes Label für "cafe" zurück', () => {
    expect(getLabelForType('cafe')).toBe('Café')
  })

  test('gibt korrektes Label für "culture" zurück', () => {
    expect(getLabelForType('culture')).toBe('Kultur')
  })

  test('gibt den key selbst zurück wenn Typ unbekannt', () => {
    expect(getLabelForType('irgendwas')).toBe('irgendwas')
  })

  test('gibt den key selbst zurück für leeren String', () => {
    expect(getLabelForType('')).toBe('')
  })
})

// ─── geocodeAddress Tests ─────────────────────────────────────────────────────

describe('geocodeAddress', () => {
    beforeEach(() => {
      global.fetch = jest.fn()
    })
  
    afterEach(() => {
      jest.resetAllMocks()
    })
  
    test('gibt Koordinaten zurück bei gültiger Adresse', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            lat: '53.5488',
            lon: '9.9872',
            display_name: 'Wilhelmsburg, Hamburg, Deutschland',
          },
        ],
      })
  
      const result = await geocodeAddress('Wilhelmsburg Hamburg')
  
      expect(result).not.toBeNull()
      expect(result?.lat).toBeCloseTo(53.5488)
      expect(result?.lng).toBeCloseTo(9.9872)
      expect(result?.displayName).toBe('Wilhelmsburg, Hamburg, Deutschland')
    })
  
    test('gibt null zurück wenn API leeres Array zurückgibt', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
  
      const result = await geocodeAddress('xyzungültig123')
      expect(result).toBeNull()
    })
  
    test('gibt null zurück wenn Response nicht ok ist', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      })
  
      const result = await geocodeAddress('irgendwas')
      expect(result).toBeNull()
    })
  
    test('gibt null zurück bei Netzwerkfehler', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
  
      const result = await geocodeAddress('irgendwas')
      expect(result).toBeNull()
    })
  
    test('parst lat und lng als Zahlen (nicht strings)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [{ lat: '10.0', lon: '20.0', display_name: 'Test' }],
      })
  
      const result = await geocodeAddress('Test')
      expect(typeof result?.lat).toBe('number')
      expect(typeof result?.lng).toBe('number')
    })
  })