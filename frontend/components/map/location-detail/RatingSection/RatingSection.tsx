'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import styles from './RatingSection.module.css'

function HalfStars({ score }: { score: number }) {
  return (
    <span className={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => {
        if (score >= i + 1) return <span key={i} className={styles.starFull}>★</span>
        if (score >= i + 0.5) return <span key={i} className={styles.starHalf}>★</span>
        return <span key={i} className={styles.starEmpty}>☆</span>
      })}
    </span>
  )
}

function RatingBar({ star, count, total }: { star: number, count: number, total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{star}</span>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

interface RatingSectionProps {
  locationId: string
  averageRating: number | null
}

export default function RatingSection({ locationId, averageRating }: RatingSectionProps) {
  const { user, token } = useUser()
  const [formOpen, setFormOpen] = useState(false)
  const [userScore, setUserScore] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const avg = averageRating ?? 0
  const display = hovered || userScore

  async function handleSubmit() {
    if (userScore === 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: Ratings endpoint noch nicht vorhanden
      // const res = await fetch(`/api/locations/${locationId}/ratings`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
      //   },
      //   body: JSON.stringify({ score: userScore }),
      // })
      // if (!res.ok) throw new Error()
      await new Promise(r => setTimeout(r, 500))
      setSubmitted(true)
    } catch {
      setError('Bewertung konnte nicht gespeichert werden')
    } finally {
      setIsSubmitting(false)
      setFormOpen(false)
    }
  }

  return (
    <div className={styles.container}>
      <strong className={styles.sectionTitle}>Bewertungen</strong>

      <div className={styles.overview}>
        <div className={styles.bars}>
          {[5, 4, 3, 2, 1].map(star => (
            <RatingBar key={star} star={star} count={0} total={0} />
          ))}
        </div>
        <div className={styles.avgBlock}>
          <span className={styles.avgNumber}>{avg > 0 ? avg.toFixed(1) : '–'}</span>
          {avg > 0 && <HalfStars score={avg} />}
          <span className={styles.avgCount}>
            {avg > 0 ? 'Ø Bewertung' : 'Keine Bewertungen'}
          </span>
        </div>
      </div>

      {user ? (
        submitted ? (
          <p className={styles.successMsg}>Bewertung eingereicht!</p>
        ) : formOpen ? (
          <div className={styles.submitRow}>
            <p className={styles.submitLabel}>Deine Bewertung</p>
            <div className={styles.starPicker}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={display >= star ? styles.starBtnOn : styles.starBtnOff}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setUserScore(star)}
                >
                  ★
                </button>
              ))}
            </div>
            {error && <p className={styles.errorMsg}>{error}</p>}
            <div className={styles.inputActions}>
              <button onClick={() => setFormOpen(false)} className={styles.cancelBtn}>
                Zurück
              </button>
              <button
                onClick={handleSubmit}
                disabled={userScore === 0 || isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? 'Wird gesendet...' : 'Abgeben'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setFormOpen(true)} className={styles.openBtn}>
            Bewertung abgeben
          </button>
        )
      ) : (
        <p className={styles.loginHint}>
          <a href="/login">Anmelden</a> um eine Bewertung abzugeben.
        </p>
      )}
    </div>
  )
}