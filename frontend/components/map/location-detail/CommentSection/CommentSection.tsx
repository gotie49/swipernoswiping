'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import { MdFlag } from 'react-icons/md'
import type { Comment } from '@/types/comment'
import ReportForm from '../ReportForm/ReportForm'
import styles from './CommentSection.module.css'

interface CommentSectionProps {
  locationId: string
  comments: Comment[]
  onCommentAdded: () => void
}

function nullTime(val: unknown): string | null {
  if (val && typeof val === 'object' && 'Time' in val && 'Valid' in val) {
    const v = val as { Time: string; Valid: boolean }
    return v.Valid ? v.Time : null
  }
  return typeof val === 'string' ? val : null
}

function formatDate(val: unknown): string {
  const time = nullTime(val)
  if (!time) return ''
  return new Date(time).toLocaleDateString('de-DE')
}

export default function CommentSection({ locationId, comments, onCommentAdded }: CommentSectionProps) {
  const { user, token } = useUser()
  const [formOpen, setFormOpen] = useState(false)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null)

  async function handleSubmit() {
    if (!text.trim()) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/locations/${locationId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text,
          location_id: locationId,
        }),
      })

      if (!res.ok) throw new Error()

      setText('')
      setSubmitted(true)
      setFormOpen(false)
      onCommentAdded()
    } catch {
      setError('Kommentar konnte nicht gespeichert werden')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <strong className={styles.sectionTitle}>Kommentare</strong>

      <div className={styles.commentList}>
        {comments.length === 0 ? (
          <p className={styles.emptyState}>Noch keine Kommentare.</p>
        ) : (
          comments.map(c => (
            <div key={c.comment_id} className={styles.commentCard}>
              <div className={styles.commentHeader}>
                <span className={styles.commentUser}>
                  {c.user_id.slice(0, 8)}...
                </span>
                <div className={styles.commentMeta}>
                  <span className={styles.commentDate}>
                    {formatDate(c.created_at)}
                  </span>
                  {user && (
                    <button
                      className={styles.reportBtn}
                      onClick={() => setReportingCommentId(c.comment_id)}
                      title="Kommentar melden"
                    >
                      <MdFlag size={14} />
                    </button>
                  )}
                </div>
              </div>
              <p className={styles.commentText}>{c.text}</p>
              {reportingCommentId === c.comment_id && (
                <ReportForm
                  type="comment"
                  targetId={c.comment_id}
                  onClose={() => setReportingCommentId(null)}
                />
              )}
            </div>
          ))
        )}
      </div>

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
            {error && <p className={styles.errorMsg}>{error}</p>}
            <div className={styles.inputActions}>
              <button onClick={() => setFormOpen(false)} className={styles.cancelBtn}>
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
          <button onClick={() => setFormOpen(true)} className={styles.openBtn}>
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