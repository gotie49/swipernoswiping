'use client'

import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MdArrowBack, MdLocationOn, MdComment, MdAddLocation } from 'react-icons/md'
import { useUser } from '@/context/UserContext'
import styles from './ModerationDetailPage.module.css'

function nullString(val: unknown): string | null {
  if (val && typeof val === 'object' && 'String' in val && 'Valid' in val) {
    const v = val as { String: string; Valid: boolean }
    return v.Valid ? v.String : null
  }
  return typeof val === 'string' ? val : null
}

function nullTime(val: unknown): string | null {
  if (val && typeof val === 'object' && 'Time' in val && 'Valid' in val) {
    const v = val as { Time: string; Valid: boolean }
    return v.Valid ? v.Time : null
  }
  return typeof val === 'string' ? val : null
}

function nullUUID(val: unknown): string | null {
  if (val && typeof val === 'object' && 'UUID' in val && 'Valid' in val) {
    const v = val as { UUID: string; Valid: boolean }
    return v.Valid ? v.UUID : null
  }
  return typeof val === 'string' ? val : null
}

function formatDate(val: unknown): string {
  const t = nullTime(val)
  if (!t) return '–'
  return new Date(t).toLocaleString('de-DE')
}

export default function ModerationDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const searchParams = useSearchParams()
  const type = searchParams.get('type') ?? 'location'
  const { token } = useUser()

  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const authHeaders: Record<string, string> = {}
      if (token) authHeaders['Authorization'] = `Bearer ${token}`

      try {
        if (type === 'neue_location') {
          // Direkt Location laden
          const res = await fetch(`/api/locations/${id}`, { headers: authHeaders })
          setData(await res.json())
        } else {
          // Report aus der Liste suchen
          const res = await fetch('/api/moderation/reports', { headers: authHeaders })
          const reports = await res.json()
          const item = (reports ?? []).find((r: Record<string, unknown>) => r.report_id === id)
          setData(item ?? null)
        }
      } catch {
        setError('Daten konnten nicht geladen werden')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [id, type, token])

  async function handleAction(status: 'approved' | 'rejected') {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      if (type === 'neue_location') {
        await fetch(`/api/locations/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: status === 'approved' ? 'active' : 'rejected' }),
        })
      } else {
        await fetch(`/api/moderation/${id}/review`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ status }),
        })
      }
      router.push('/moderation')
    } catch {
      setError('Aktion fehlgeschlagen')
    }
  }

  const isQueue = type === 'neue_location'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => router.push('/moderation')}>
          <MdArrowBack size={22} />
        </button>
        <h1 className={styles.title}>
          {isQueue ? 'Location prüfen' : type === 'location' ? 'Location Report' : 'Kommentar Report'}
        </h1>
        <div style={{ width: 32 }} />
      </div>

      <div className={styles.content}>
        {isLoading && <p className={styles.loadingText}>Wird geladen...</p>}
        {error && <p className={styles.errorText}>{error}</p>}

        {data && (
          <>
            <div className={styles.nameRow}>
              <div className={styles.locationIcon}>
                {isQueue
                  ? <MdAddLocation size={24} color="#22C55E" />
                  : type === 'location'
                    ? <MdLocationOn size={24} color="#F59E0B" />
                    : <MdComment size={24} color="#EF4444" />
                }
              </div>
              <div>
                <p className={styles.locationName}>
                  {isQueue
                    ? String(data.name ?? '–')
                    : type === 'location' ? 'Gemeldete Location' : 'Gemeldeter Kommentar'}
                </p>
                <p className={styles.submittedBy}>
                  ID: {String(id).slice(0, 8)}...
                </p>
              </div>
            </div>

            <hr className={styles.divider} />

            {isQueue ? (
              <>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Adresse</p>
                  <p className={styles.fieldValue}>{nullString(data.address) ?? '–'}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Kategorie</p>
                  <p className={styles.fieldValue}>{nullString(data.location_type) ?? '–'}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Beschreibung</p>
                  <div className={styles.descriptionBox}>
                    <p className={styles.fieldValue}>{nullString(data.description) ?? '–'}</p>
                  </div>
                </div>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Eingereicht</p>
                  <p className={styles.fieldValue}>{formatDate(data.created_at)}</p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Grund</p>
                  <p className={styles.fieldValue}>{String(data.reason ?? '–')}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Status</p>
                  <p className={styles.fieldValue}>{nullString(data.status) ?? '–'}</p>
                </div>
                <div className={styles.field}>
                  <p className={styles.fieldLabel}>Gemeldet am</p>
                  <p className={styles.fieldValue}>{formatDate(data.created_at)}</p>
                </div>
                {nullUUID(data.location_id) && (
                  <div className={styles.field}>
                    <p className={styles.fieldLabel}>Location ID</p>
                    <p className={styles.fieldValue}>{nullUUID(data.location_id)}</p>
                  </div>
                )}
                {nullUUID(data.comment_id) && (
                  <div className={styles.field}>
                    <p className={styles.fieldLabel}>Kommentar ID</p>
                    <p className={styles.fieldValue}>{nullUUID(data.comment_id)}</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {data && (
        <div className={styles.actions}>
          {isQueue ? (
            <>
              <button onClick={() => handleAction('approved')} className={styles.approveBtn}>
                ✓ Freigeben
              </button>
              <button onClick={() => handleAction('rejected')} className={styles.rejectBtn}>
                ✕ Ablehnen
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('rejected')}
              className={styles.rejectBtn}
              style={{ flex: 1 }}
            >
              ✕ Inhalt entfernen
            </button>
          )}
        </div>
      )}
    </div>
  )
}