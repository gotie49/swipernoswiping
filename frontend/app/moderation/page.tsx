'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MdArrowBack, MdMenu, MdLocationOn, MdComment, MdCheckCircle, MdCancel, MdVisibility, MdDelete } from 'react-icons/md'
import styles from './ModerationPage.module.css'

type FilterType = 'alle' | 'location' | 'kommentar'

interface ModerationItem {
  id: string
  type: 'location' | 'kommentar'
  title: string
  subtitle: string
  meta: string
  reportCount?: number
}

const DUMMY_ITEMS: ModerationItem[] = [
  { id: '1', type: 'location',  title: 'Ortsname',  subtitle: 'Dratelnstraße 2, Hamburg', meta: 'Neue Location · vor 10 Min.' },
  { id: '2', type: 'kommentar', title: 'Username',   subtitle: '"Totaler Müll, geht mal weg..."', meta: 'Hafen · vor 22 Min.', reportCount: 2 },
  { id: '3', type: 'location',  title: 'Ortsname',  subtitle: 'Dratelnstraße 2, Hamburg', meta: 'Neue Location · vor 20 Min.' },
  { id: '4', type: 'kommentar', title: 'Username',   subtitle: '"Totaler Müll, geht mal weg..."', meta: 'Hafen · vor 22 Min.', reportCount: 2 },
  { id: '5', type: 'kommentar', title: 'Username',   subtitle: '"Totaler Müll, geht mal weg..."', meta: 'Hafen · vor 22 Min.', reportCount: 2 },
]

export default function ModerationPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterType>('alle')

  const filtered = DUMMY_ITEMS.filter(item =>
    filter === 'alle' || item.type === filter
  )

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => router.push('/map')}>
          <MdArrowBack size={22} />
        </button>
        <h1 className={styles.title}>Moderation</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Filter Tags */}
      <div className={styles.filterRow}>
        {(['alle', 'location', 'kommentar'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? styles.filterBtnActive : styles.filterBtn}
            style={filter === f ? {
              background: f === 'location' ? '#F59E0B' : f === 'kommentar' ? '#EF4444' : '#111827',
              borderColor: f === 'location' ? '#F59E0B' : f === 'kommentar' ? '#EF4444' : '#111827',
            } : {
              color: f === 'location' ? '#F59E0B' : f === 'kommentar' ? '#EF4444' : '#111827',
              borderColor: f === 'location' ? '#F59E0B' : f === 'kommentar' ? '#EF4444' : '#6B7280',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className={styles.list}>
        {filtered.map(item => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemIcon}>
              {item.type === 'location'
                ? <MdLocationOn size={22} color="#F59E0B" />
                : <MdComment size={22} color="#EF4444" />
              }
            </div>
            <div className={styles.itemContent}>
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemSubtitle}>{item.subtitle}</span>
              <span className={styles.itemMeta}>
                {item.reportCount ? `${item.reportCount} Reports · ` : ''}{item.meta}
              </span>
            </div>
            <div className={styles.itemActions}>
              {item.type === 'location' ? (
                <>
                  <button className={styles.actionBtnGreen}><MdCheckCircle size={20} /></button>
                  <button className={styles.actionBtnRed}><MdCancel size={20} /></button>
                </>
              ) : (
                <>
                  <button className={styles.actionBtnRed}><MdDelete size={20} /></button>
                </>
              )}
              <button
                className={styles.actionBtnGray}
                onClick={() => router.push(`/moderation/${item.id}`)}
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