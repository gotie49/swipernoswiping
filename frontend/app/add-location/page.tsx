'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MdArrowBack } from 'react-icons/md'
import Button from '@/components/ui/Button/Button'
import Input from '@/components/ui/Input/Input'
import { useUser } from '@/context/UserContext'
import { LOCATION_TYPES } from '@/types/locationTypes'
import { geocodeAddress, GeocodingResult } from '@/lib/geocoding'
import styles from './AddLocationPage.module.css'

export default function AddLocationPage() {
  const router = useRouter()
  const { token } = useUser()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [locationType, setLocationType] = useState('')
  const [openingHours, setOpeningHours] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [geocoding, setGeocoding] = useState(false)
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult | null>(null)
  const [geocodingError, setGeocodingError] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (address.trim().length < 5) {
        setGeocodingResult(null)
        setGeocodingError(false)
        setGeocoding(false)
        return
      }

      setGeocoding(true)
      setGeocodingError(false)

      const result = await geocodeAddress(address)
      setGeocoding(false)

      if (result) {
        setGeocodingResult(result)
        setGeocodingError(false)
      } else {
        setGeocodingResult(null)
        setGeocodingError(true)
      }
    }, 800)
  }, [address])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!geocodingResult) {
      setError('Bitte gib eine gültige Adresse ein.')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          description,
          address,
          location_type: locationType,
          lat: geocodingResult.lat,
          lng: geocodingResult.lng,
          opening_hours: openingHours ? { text: openingHours } : null,
          status: 'pending',  // ← zur Moderation einreichen
        }),
      })

      if (!res.ok) {
        const msg = await res.text()
        setError(msg || 'Einreichen fehlgeschlagen')
        return
      }

      setSuccess(true)
    } catch {
      setError('Verbindung zum Server fehlgeschlagen')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <h2 className={styles.successTitle}>Ort eingereicht!</h2>
          <p className={styles.successText}>
            Dein Ort wurde zur Prüfung eingereicht und erscheint bald auf der Karte.
          </p>
          <Button onClick={() => router.push('/map')}>
            Zurück zur Karte
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <MdArrowBack size={22} />
        </button>
        <h1 className={styles.title}>Ort hinzufügen</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name des Ortes"
          required
        />

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Adresse</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Straße, Hausnummer, Stadt"
            required
            className={styles.addressInput}
            style={{
              borderColor: geocodingError
                ? '#EF4444'
                : geocodingResult
                  ? '#22C55E'
                  : undefined,
            }}
          />
          {geocoding && (
            <p className={styles.geocodingHint}>Adresse wird gesucht...</p>
          )}
          {geocodingResult && !geocoding && (
            <p className={styles.geocodingSuccess}>
              {geocodingResult.displayName}
            </p>
          )}
          {geocodingError && !geocoding && (
            <p className={styles.geocodingError}>
              Adresse nicht gefunden. Bitte genauer eingeben.
            </p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Kategorie</label>
          <div className={styles.typeGrid}>
            {LOCATION_TYPES.map(type => (
              <button
                key={type.key}
                type="button"
                onClick={() => setLocationType(type.key)}
                className={styles.typeButton}
                style={{
                  background: locationType === type.key ? type.color : 'white',
                  color: locationType === type.key ? 'white' : type.color,
                  borderColor: type.color,
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Beschreibung</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Kurze Beschreibung des Ortes..."
            rows={3}
            className={styles.textarea}
          />
        </div>

        <Input
          label="Öffnungszeiten"
          value={openingHours}
          onChange={e => setOpeningHours(e.target.value)}
          placeholder="z.B. Mo–Fr 9–18 Uhr"
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button
          type="submit"
          disabled={isLoading || !geocodingResult || geocoding}
        >
          {isLoading ? 'Wird eingereicht...' : 'Ort einreichen'}
        </Button>
      </form>
    </div>
  )
}