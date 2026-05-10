'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import styles from './ReportForm.module.css'

const REASONS: Record<'comment' | 'location', string[]> = {
  comment: [
    'Beleidigung / Hassrede',
    'Spam oder Werbung',
    'Falsche Informationen',
    'Unangemessener Inhalt',
    'Sonstiges',
  ],
  location: [
    'Existiert nicht mehr',
    'Falsche Adresse',
    'Unangemessener Inhalt',
    'Duplikat',
    'Sonstiges',
  ],
}

interface ReportFormProps {
  type: 'comment' | 'location'
  targetId: string
  onClose: () => void
}

export default function ReportForm({ type, targetId, onClose }: ReportFormProps) {
  const { token } = useUser()
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selectedReason) return
    setIsSubmitting(true)
    setError(null)

    try {
      const url = type === 'location'
        ? `/api/locations/${targetId}/report`
        : `/api/comments/${targetId}/report`

      const body = type === 'location'
        ? { location_id: targetId, reason: selectedReason, description }
        : { comment_id: targetId, reason: selectedReason, description }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()
      setSubmitted(true)
    } catch {
      setError('Meldung konnte nicht gesendet werden')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.container}>
        <p className={styles.successMsg}>Meldung eingereicht. Danke!</p>
        <button onClick={onClose} className={styles.backBtn}>Schließen</button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <p className={styles.title}>Grund der Meldung</p>

      <div className={styles.reasonList}>
        {REASONS[type].map(reason => (
          <button
            key={reason}
            type="button"
            onClick={() => setSelectedReason(reason)}
            className={selectedReason === reason ? styles.reasonBtnActive : styles.reasonBtn}
          >
            {reason}
          </button>
        ))}
      </div>

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Optionale Beschreibung..."
        rows={2}
        className={styles.textarea}
      />

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        <button onClick={onClose} className={styles.backBtn}>
          Zurück
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedReason || isSubmitting}
          className={styles.submitBtn}
        >
          {isSubmitting ? 'Wird gesendet...' : 'Absenden'}
        </button>
      </div>
    </div>
  )
}