'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import { MdFlag } from 'react-icons/md'
import ReportForm from '../ReportForm/ReportForm'
import styles from './CommentSection.module.css'

interface Comment {
  id: string
  user: string
  text: string
  createdAt: string
}

const EXAMPLE_COMMENTS: Comment[] = [
  { id: '1', user: 'Lena B.',  text: 'Super Ort, sehr empfehlenswert!',          createdAt: '12.04.2025' },
  { id: '2', user: 'Tom R.',   text: 'War leider geschlossen als ich da war.',    createdAt: '03.05.2025' },
  { id: '3', user: 'Sara M.',  text: 'Tolle Atmosphäre, gerne wieder!',           createdAt: '21.05.2025' },
]

export default function CommentSection({ locationId }: { locationId: string }) {
  const { user } = useUser()
  const [formOpen, setFormOpen] = useState(false)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)

  async function handleSubmit() {
    if (!text.trim()) return
    setIsSubmitting(true)
    // TODO: await fetch(`/api/locations/${locationId}/comments`, { method: 'POST', body: JSON.stringify({ text }) })
    await new Promise(r => setTimeout(r, 500))
    setSubmitted(true)
    setIsSubmitting(false)
    setFormOpen(false)
  }

  return (
    <div className={styles.container}>
      <strong className={styles.sectionTitle}>Kommentare</strong>

      {/* Liste */}
      <div className={styles.commentList}>
        {EXAMPLE_COMMENTS.map(c => (
          <div key={c.id} className={styles.commentCard}>
            <div className={styles.commentHeader}>
              <span className={styles.commentUser}>{c.user}</span>
              <div className={styles.commentMeta}>
                <span className={styles.commentDate}>{c.createdAt}</span>
                {user && (
                  <button
                    className={styles.reportBtn}
                    onClick={() => setReportingCommentId(c.id)}
                    title="Kommentar melden"
                  >
                    <MdFlag size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className={styles.commentText}>{c.text}</p>

            {/* Report Form inline unter dem Kommentar */}
            {reportingCommentId === c.id && (
              <ReportForm
                type="comment"
                targetId={c.id}
                onClose={() => setReportingCommentId(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Kommentar schreiben */}
      {user ? (
        submitted ? (
          <p className={styles.successMsg}>Kommentar eingereicht!</p>
        ) : formOpen ? (
          <div className={styles.inputArea}>
            <textarea
              autoFocus
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Dein Kommentar..."
              rows={3}
              className={styles.textarea}
            />
            <div className={styles.inputActions}>
              <button
                onClick={() => setFormOpen(false)}
                className={styles.cancelBtn}
              >
                Zurück
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || isSubmitting}
                className={styles.submitBtn}
              >
                {isSubmitting ? 'Wird gesendet...' : 'Absenden'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setFormOpen(true)}
            className={styles.openBtn}
          >
            Kommentar schreiben
          </button>
        )
      ) : (
        <p className={styles.loginHint}>
          <a href="/login">Anmelden</a> um einen Kommentar zu schreiben.
        </p>
      )}
    </div>
  )
}