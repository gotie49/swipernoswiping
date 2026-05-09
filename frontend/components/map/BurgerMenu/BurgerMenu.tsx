'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { MdClose, MdLogin, MdLogout, MdAddLocation, MdAdminPanelSettings } from 'react-icons/md'
import { LOCATION_TYPES as BASE_TYPES } from '@/types/locationTypes'
import styles from './BurgerMenu.module.css'

const LOCATION_TYPES = [
  { key: 'alle', label: 'Alle', color: '#111827' },
  ...BASE_TYPES,
]

interface BurgerMenuProps {
  activeTypes: string[]
  onTypeToggle: (type: string) => void
  onResetTypes: () => void
  onClose: () => void
}

export default function BurgerMenu({ activeTypes, onTypeToggle, onResetTypes, onClose }: BurgerMenuProps) {
  const { user, logout } = useUser()
  const router = useRouter()

  function handleAuthAction() {
    if (user) {
      logout()
      onClose()
    } else {
      router.push('/login')
      onClose()
    }
  }

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.title}>Menü</p>
          <button className={styles.closeButton} onClick={onClose}>
            <MdClose size={22} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className={styles.userCard}>
            <p className={styles.userLabel}>Angemeldet als</p>
            <p className={styles.userName}>{user.name}</p>
          </div>
        )}

        {/* Filter Tags */}
        <p className={styles.sectionLabel}>Kategorien</p>
        <div className={styles.tagList}>
          {LOCATION_TYPES.map(type => {
            const isActive = type.key === 'alle'
              ? activeTypes.length === 0
              : activeTypes.includes(type.key)
            return (
              <button
                key={type.key}
                onClick={() => type.key === 'alle' ? onResetTypes() : onTypeToggle(type.key)}
                className={styles.tag}
                style={{
                  borderColor: type.color,
                  background: isActive ? type.color : 'white',
                  color: isActive ? 'white' : type.color,
                }}
              >
                {type.label}
              </button>
            )
          })}
        </div>

        <div className={styles.spacer} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {user?.role === 'moderator' && (
            <button
              onClick={() => { router.push('/moderation'); onClose() }}
              className={styles.authButton}
              style={{ background: '#7C3AED' }}
            >
              <MdAdminPanelSettings size={18} /> Moderation
            </button>
          )}
          {user && (
            <button
              onClick={() => { router.push('/add-location'); onClose() }}
              className={styles.authButton}
              style={{ background: '#1D4ED8' }}
            >
              <MdAddLocation size={18} /> Ort hinzufügen
            </button>
          )}
          <button
            onClick={handleAuthAction}
            className={styles.authButton}
            style={{ background: user ? '#EF4444' : '#111827' }}
          >
            {user
              ? <><MdLogout size={18} /> Abmelden</>
              : <><MdLogin size={18} /> Anmelden</>
            }
          </button>
        </div>
      </div>
    </>
  )
}