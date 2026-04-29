'use client'
import type { Location } from '@/types/location'
import { MdLocationOn, MdAccessTime } from 'react-icons/md'
import styles from './LocationDetail.module.css'

interface LocationDetailProps {
  location: Location
}

const EXAMPLE_RATINGS = [
  { user: 'Anna K.', stars: 5, comment: 'Absolut empfehlenswert, sehr schöner Ort!' },
  { user: 'Max M.', stars: 4, comment: 'Schöne Atmosphäre, kann ich nur empfehlen.' },
  { user: 'Julia S.', stars: 3, comment: 'Ganz okay, aber zur Stoßzeit sehr voll.' },
]

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

export default function LocationDetail({ location }: LocationDetailProps) {
  return (
    <div className={styles.container}>

      {/* Name & Typ */}
      <div className={styles.nameRow}>
        <strong className={styles.name}>{location.name}</strong>
        {location.location_type && (
          <span className={styles.typeBadge}>{location.location_type}</span>
        )}
      </div>

      {/* Basis-Infos */}
      <div className={styles.infoList}>
        {location.address && (
          <p className={styles.infoText}>
            <MdLocationOn size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {location.address}
          </p>
        )}
        {location.opening_hours && (
          <p className={styles.infoText}>
            <MdAccessTime size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {location.opening_hours}
          </p>
        )}
        {location.description && (
          <p className={styles.description}>{location.description}</p>
        )}
      </div>

      <hr className={styles.divider} />

      {/* Bewertungen */}
      <strong className={styles.sectionTitle}>Bewertungen</strong>
      <div className={styles.ratingList}>
        {EXAMPLE_RATINGS.map((r, i) => (
          <div key={i} className={styles.ratingCard}>
            <div className={styles.ratingHeader}>
              <span className={styles.ratingUser}>{r.user}</span>
              <Stars count={r.stars} />
            </div>
            <p className={styles.ratingComment}>{r.comment}</p>
          </div>
        ))}
      </div>

      <hr className={styles.divider} />

      {/* Kommentar */}
      <strong className={styles.sectionTitle}>Kommentar hinterlassen</strong>
      <textarea
        placeholder="Dein Kommentar..."
        rows={3}
        className={styles.textarea}
      />
      <button className={styles.submitButton}>
        Absenden
      </button>

    </div>
  )
}