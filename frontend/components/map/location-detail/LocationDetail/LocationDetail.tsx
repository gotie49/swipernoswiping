'use client'

import type { Location } from '@/types/location'
import { MdLocationOn, MdAccessTime } from 'react-icons/md'
import { useLocationDetail } from '@/hooks/useLocationDetail'
import RatingSection from '../RatingSection/RatingSection'
import CommentSection from '../CommentSection/CommentSection'
import ReportButton from '../ReportButton/ReportButton'
import styles from './LocationDetail.module.css'

interface LocationDetailProps {
  location: Location
}

export default function LocationDetail({ location }: LocationDetailProps) {
  const { detail, comments, isLoading, error, reload } = useLocationDetail(location.location_id)

  return (
    <div className={styles.container}>
      <div className={styles.nameRow}>
        <strong className={styles.name}>{location.name}</strong>
        {location.location_type && (
          <span className={styles.typeBadge}>{location.location_type}</span>
        )}
      </div>

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

      {isLoading && <p className={styles.loadingText}>Wird geladen...</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <RatingSection
        locationId={location.location_id}
        averageRating={detail?.average_rating ?? null}
      />

      <hr className={styles.divider} />

      <CommentSection
        locationId={location.location_id}
        comments={comments}
        onCommentAdded={reload}
      />

      <hr className={styles.divider} />

      <ReportButton locationId={location.location_id} />
    </div>
  )
}