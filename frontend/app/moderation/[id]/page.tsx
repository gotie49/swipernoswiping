'use client'

import { useRouter, useParams } from 'next/navigation'
import { MdArrowBack, MdLocationOn } from 'react-icons/md'
import styles from './ModerationDetailPage.module.css'

const DUMMY_DETAIL = {
  name: 'Stadtbibliothek Mitte',
  submittedBy: 'user_2341',
  address: 'Dratelnstraße 2, Hamburg',
  type: 'Bibliothek',
  description: 'Öffentliche Stadtbibliothek mit Lesecafé, WLAN und Veranstaltungsraum im EG.',
  submittedAt: 'vor 10 Min. · 6. Mai 2026',
}

export default function ModerationDetailPage() {
  const router = useRouter()
  const { id } = useParams()

  function handleApprove() {
    // TODO: await fetch(`/api/moderation/${id}/approve`, { method: 'POST' })
    router.push('/moderation')
  }

  function handleReject() {
    // TODO: await fetch(`/api/moderation/${id}/reject`, { method: 'POST' })
    router.push('/moderation')
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.iconBtn} onClick={() => router.push('/moderation')}>
          <MdArrowBack size={22} />
        </button>
        <h1 className={styles.title}>Location prüfen</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Inhalt */}
      <div className={styles.content}>
        {/* Name & Einreicher */}
        <div className={styles.nameRow}>
          <div className={styles.locationIcon}>
            <MdLocationOn size={24} color="#F59E0B" />
          </div>
          <div>
            <p className={styles.locationName}>{DUMMY_DETAIL.name}</p>
            <p className={styles.submittedBy}>Eingereicht von {DUMMY_DETAIL.submittedBy}</p>
          </div>
        </div>

        <hr className={styles.divider} />

        {/* Felder */}
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Adresse</p>
          <p className={styles.fieldValue}>{DUMMY_DETAIL.address}</p>
        </div>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Typ</p>
          <p className={styles.fieldValue}>{DUMMY_DETAIL.type}</p>
        </div>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Beschreibung</p>
          <div className={styles.descriptionBox}>
            <p className={styles.fieldValue}>{DUMMY_DETAIL.description}</p>
          </div>
        </div>
        <div className={styles.field}>
          <p className={styles.fieldLabel}>Eingereicht</p>
          <p className={styles.fieldValue}>{DUMMY_DETAIL.submittedAt}</p>
        </div>
      </div>

      {/* Aktionen */}
      <div className={styles.actions}>
        <button onClick={handleApprove} className={styles.approveBtn}>
          ✓ Freigeben
        </button>
        <button onClick={handleReject} className={styles.rejectBtn}>
          ✕ Ablehnen
        </button>
      </div>
    </div>
  )
}