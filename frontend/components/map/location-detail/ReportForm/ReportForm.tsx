'use client'

import { useState } from 'react'
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
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!selectedReason) return
    setIsSubmitting(true)
    // TODO: await fetch(`/api/reports`, { method: 'POST', body: JSON.stringify({ type, targetId, reason: selectedReason, description }) })
    await new Promise(r => setTimeout(r, 500))
    setSubmitted(true)
    setIsSubmitting(false)
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

      {/* Vorgefertigte Gründe */}
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

      {/* Optionale Beschreibung */}
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Optionale Beschreibung..."
        rows={2}
        className={styles.textarea}
      />

      {/* Aktionen */}
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