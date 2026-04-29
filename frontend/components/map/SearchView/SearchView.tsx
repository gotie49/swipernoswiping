'use client'

import { useState } from 'react'
import type { Location } from '@/types/location'
import BurgerMenu from '@/components/map/BurgerMenu/BurgerMenu'
import { MdArrowBack, MdMenu } from 'react-icons/md'
import styles from './SearchView.module.css'

interface SearchViewProps {
  locations: Location[]
  activeTypes: string[]
  onTypeToggle: (type: string) => void
  onSelect: (location: Location) => void
  onClose: () => void
}

export default function SearchView({ locations, activeTypes, onTypeToggle, onSelect, onClose }: SearchViewProps) {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const filtered = locations.filter(l => {
    const matchesQuery =
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.address?.toLowerCase().includes(query.toLowerCase())

    const matchesType =
      activeTypes.length === 0 ||
      (l.location_type && activeTypes.includes(l.location_type))

    return matchesQuery && matchesType
  })

  return (
    <div className={styles.container} onClick={e => e.stopPropagation()}>

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.iconButton} onClick={onClose}>
          <MdArrowBack size={22} />
        </button>

        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Suchen..."
          className={styles.searchInput}
        />

        <button className={styles.iconButton} onClick={() => setMenuOpen(true)}>
          <MdMenu size={22} />
        </button>
      </div>

      {/* Active Filters */}
      {activeTypes.length > 0 && (
        <div className={styles.activeFilters}>
          {activeTypes.map(type => (
            <span key={type} className={styles.filterTag}>
              {type}
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      <div className={styles.results}>
        {filtered.length === 0 ? (
          <p className={styles.emptyState}>Keine Ergebnisse gefunden.</p>
        ) : (
          filtered.map(location => (
            <div
              key={location.location_id}
              onClick={() => onSelect(location)}
              className={styles.resultItem}
            >
              <div className={styles.resultName}>{location.name}</div>
              {location.address && (
                <div className={styles.resultAddress}>{location.address}</div>
              )}
            </div>
          ))
        )}
      </div>

      {menuOpen && (
        <BurgerMenu
          activeTypes={activeTypes}
          onTypeToggle={onTypeToggle}
          onClose={() => setMenuOpen(false)}
        />
      )}

    </div>
  )
}