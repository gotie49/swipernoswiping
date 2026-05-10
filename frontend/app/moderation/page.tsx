'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MdArrowBack, MdLocationOn, MdComment, MdCheckCircle, MdCancel, MdVisibility, MdDelete, MdAddLocation } from 'react-icons/md'
import { useUser } from '@/context/UserContext'
import styles from './ModerationPage.module.css'

type FilterType = 'alle' | 'location' | 'kommentar' | 'neue_locations'

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
  if (!t) return ''
  return new Date(t).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type ModerationItemType = 'location' | 'kommentar' | 'neue_location'

interface ModerationItem {
  id: string
  type: ModerationItemType
  locationId: string | null
  commentId: string | null
  reason: string
  title: string
  subtitle: string
  date: string
}

const FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: 'alle',           label: 'Alle',           color: '#111827' },
  { key: 'location',       label: 'Locations',      color: '#F59E0B' },
  { key: 'kommentar',      label: 'Kommentare',     color: '#EF4444' },
  { key: 'neue_locations', label: 'Neue Locations', color: '#22C55E' },
]

export default function ModerationPage() {
  const router = useRouter()
  const { token } = useUser()
  const [filter, setFilter] = useState<FilterType>('alle')
  const [items, setItems] = useState<ModerationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)

      const authHeaders: Record<string, string> = {}
      if (token) authHeaders['Authorization'] = `Bearer ${token}`

      try {
        const [reportsRes, locationsRes] = await Promise.all([
          fetch('/api/moderation/reports', { headers: authHeaders }),
          fetch('/api/locations', { headers: authHeaders }),
        ])

        const reportsData = await reportsRes.json()
        const locationsData = await locationsRes.json()

        const reportItems: ModerationItem[] = (reportsData ?? []).map((r: Record<string, unknown>) => ({
          id: String(r.report_id),
          type: nullUUID(r.location_id) ? 'location' : 'kommentar',
          locationId: nullUUID(r.location_id),
          commentId: nullUUID(r.comment_id),
          reason: String(r.reason ?? ''),
          title: nullUUID(r.location_id) ? 'Location Report' : 'Kommentar Report',
          subtitle: String(r.reason ?? '–'),
          date: formatDate(r.created_at),
        }))

        const pendingItems: ModerationItem[] = (locationsData ?? [])
          .filter((l: Record<string, unknown>) => nullString(l.status) === 'pending')
          .map((l: Record<string, unknown>) => ({
            id: String(l.location_id),
            type: 'neue_location' as ModerationItemType,
            locationId: String(l.location_id),
            commentId: null,
            reason: '',
            title: String(l.name ?? ''),
            subtitle: nullString(l.address) ?? '–',
            date: formatDate(l.created_at),
          }))

        setItems([...pendingItems, ...reportItems])
      } catch {
        setError('Daten konnten nicht geladen werden')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [token])

  const filtered = items.filter(item => {
    if (filter === 'alle') return true
    if (filter === 'location') return item.type === 'location'
    if (filter === 'kommentar') return item.type === 'kommentar'
    if (filter === 'neue_locations') return item.type === 'neue_location'
    return true
  })

  async function handleAction(item: ModerationItem, status: 'approved' | 'rejected') {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      if (item.type === 'neue_location') {
        await fetch(`/api/locations/${item.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status: status === 'approved' ? 'active' : 'rejected' }),
        })
      } else {
        await fetch(`/api/moderation/${item.id}/review`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ status }),
        })
      }
      setItems(prev => prev.filter(i => i.id !== item.id))
    } catch {
      setError('Aktion fehlgeschlagen')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => router.push('/map')}>
          <MdArrowBack size={22} />
        </button>
        <h1 className={styles.title}>Moderation</h1>
        <div style={{ width: 32 }} />
      </div>

      <div className={styles.filterRow}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? styles.filterBtnActive : styles.filterBtn}
            style={filter === f.key
              ? { background: f.color, borderColor: f.color }
              : { color: f.color, borderColor: f.color }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <p className={styles.loadingText}>Wird geladen...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.list}>
        {!isLoading && filtered.length === 0 && (
          <p className={styles.emptyText}>Keine Einträge vorhanden.</p>
        )}
        {filtered.map(item => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemIcon}>
              {item.type === 'neue_location'
                ? <MdAddLocation size={22} color="#22C55E" />
                : item.type === 'location'
                  ? <MdLocationOn size={22} color="#F59E0B" />
                  : <MdComment size={22} color="#EF4444" />
              }
            </div>
            <div className={styles.itemContent}>
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemSubtitle}>{item.subtitle}</span>
              <span className={styles.itemMeta}>{item.date}</span>
            </div>
            <div className={styles.itemActions}>
              {item.type === 'neue_location' ? (
                <>
                  <button className={styles.actionBtnGreen} onClick={() => handleAction(item, 'approved')}>
                    <MdCheckCircle size={20} />
                  </button>
                  <button className={styles.actionBtnRed} onClick={() => handleAction(item, 'rejected')}>
                    <MdCancel size={20} />
                  </button>
                </>
              ) : (
                <button className={styles.actionBtnRed} onClick={() => handleAction(item, 'rejected')}>
                  <MdDelete size={20} />
                </button>
              )}
              <button
                className={styles.actionBtnGray}
                onClick={() => router.push(`/moderation/${item.id}?type=${item.type}`)}
              >
                <MdVisibility size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}