'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import styles from './RatingSection.module.css'

interface Rating {
  user: string
  score: number
}

const EXAMPLE_RATINGS: Rating[] = [
  { user: 'Anna K.',  score: 5 },
  { user: 'Max M.',   score: 4 },
  { user: 'Julia S.', score: 4 },
  { user: 'Tom R.',   score: 3 },
  { user: 'Lena B.',  score: 2 },
  { user: 'Erik W.',  score: 1 },
]

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

export default function RatingSection({ locationId }: { locationId: string }) {
  const { user } = useUser()
  const [formOpen, setFormOpen] = useState(false)
  const [userScore, setUserScore] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const total = EXAMPLE_RATINGS.length
  const avg = EXAMPLE_RATINGS.reduce((a, r) => a + r.score, 0) / total

  const counts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: EXAMPLE_RATINGS.filter(r => Math.round(r.score) === star).length,
  }))

  async function handleSubmit() {
    if (userScore === 0) return
    setIsSubmitting(true)
    // TODO: await fetch(`/api/locations/${locationId}/ratings`, { method: 'POST', body: JSON.stringify({ score: userScore }) })
    await new Promise(r => setTimeout(r, 500))
    setSubmitted(true)
    setIsSubmitting(false)
    setFormOpen(false)
  }

  const display = hovered || userScore

  return (
    <div className={styles.container}>
      <strong className={styles.sectionTitle}>Bewertungen</strong>

      {/* Übersicht */}
      <div className={styles.overview}>
        <div className={styles.bars}>
          {counts.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={total} />
          ))}
        </div>
        <div className={styles.avgBlock}>
          <span className={styles.avgNumber}>{avg.toFixed(1)}</span>
          <HalfStars score={avg} />
          <span className={styles.avgCount}>{total} Bewertungen</span>
        </div>
      </div>

      {/* Bewertung abgeben */}
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