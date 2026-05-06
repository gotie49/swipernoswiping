'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MdArrowBack } from 'react-icons/md'
import Button from '@/components/ui/Button/Button'
import Input from '@/components/ui/Input/Input'
import styles from './AddLocationPage.module.css'

const LOCATION_TYPES = [
  { key: 'cafe',       label: 'Café' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'park',       label: 'Natur' },
  { key: 'sports',     label: 'Sport' },
  { key: 'shopping',   label: 'Shopping' },
  { key: 'culture',    label: 'Kultur' },
]

export default function AddLocationPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [locationType, setLocationType] = useState('')
  const [openingHours, setOpeningHours] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Später: echter API-Call
      // const res = await fetch('/api/locations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      //   body: JSON.stringify({ name, description, address, location_type: locationType, opening_hours: openingHours }),
      // })

      await new Promise(resolve => setTimeout(resolve, 800)) // simuliert Netzwerk
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
          <p className={styles.successIcon}>✅</p>
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
      {/* Header */}
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
        <Input
          label="Adresse"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Straße, Hausnummer, Stadt"
          required
        />

        {/* Typ-Auswahl */}
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
                  background: locationType === type.key ? '#111827' : 'white',
                  color: locationType === type.key ? 'white' : '#111827',
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Beschreibung */}
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Wird eingereicht...' : 'Ort einreichen'}
        </Button>
      </form>
    </div>
  )
}