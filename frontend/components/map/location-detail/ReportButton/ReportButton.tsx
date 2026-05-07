'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import { MdFlag } from 'react-icons/md'
import ReportForm from '../ReportForm/ReportForm'
import styles from './ReportButton.module.css'

export default function ReportButton({ locationId }: { locationId: string }) {
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  if (!user) return null

  return (
    <div className={styles.container}>
      {open ? (
        <ReportForm
          type="location"
          targetId={locationId}
          onClose={() => setOpen(false)}
        />
      ) : (
        <button onClick={() => setOpen(true)} className={styles.button}>
          <MdFlag size={15} />
          Ort melden
        </button>
      )}
    </div>
  )
}