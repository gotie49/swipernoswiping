'use client'
import { useState } from 'react'
import type { Location } from '@/types/location'
import SearchView from '@/components/map/SearchView/SearchView'
import BurgerMenu from '@/components/map/BurgerMenu/BurgerMenu'
import styles from './SearchBar.module.css'
import { MdSearch, MdMenu } from 'react-icons/md'

interface SearchBarProps {
  locations: Location[]
  activeTypes: string[]
  onTypeToggle: (type: string) => void
  onLocationSelect: (location: Location) => void
}

export default function SearchBar({ locations, activeTypes, onTypeToggle, onLocationSelect }: SearchBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLocationSelect(location: Location) {
    setSearchOpen(false)
    onLocationSelect(location)
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.searchInput} onClick={() => setSearchOpen(true)}>
          <MdSearch size={20} color="#9CA3AF" />
          <span>Suchen...</span>
        </div>
        <button className={styles.menuButton} onClick={() => setMenuOpen(true)}>
          <MdMenu size={22} color="#374151" />
        </button>
      </div>

      {searchOpen && (
        <SearchView
          onTypeToggle={onTypeToggle}
          locations={locations}
          activeTypes={activeTypes}
          onSelect={handleLocationSelect}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {menuOpen && (
        <BurgerMenu
          activeTypes={activeTypes}
          onTypeToggle={onTypeToggle}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  )
}