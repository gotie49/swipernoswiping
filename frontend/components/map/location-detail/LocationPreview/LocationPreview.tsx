'use client'
import type { Location } from '@/types/location'
import { MdClose } from 'react-icons/md'
import styles from './LocationPreview.module.css'

interface LocationPreviewProps {
  location: Location
  onClose: () => void
}

export default function LocationPreview({ location, onClose }: LocationPreviewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <strong className={styles.name}>{location.name}</strong>
        {location.address && (
          <p className={styles.address}>{location.address}</p>
        )}
      </div>
      <button className={styles.closeButton} onClick={onClose}>
        <MdClose size={20} />
      </button>
    </div>
  )
}