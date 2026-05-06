'use client'

const LOCATION_TYPES = [
  { key: 'cafe',       label: 'Café',       color: '#F59E0B' },
  { key: 'restaurant', label: 'Restaurant', color: '#EF4444' },
  { key: 'park',       label: 'Natur',      color: '#22C55E' },
  { key: 'sports',     label: 'Sport',      color: '#3B82F6' },
  { key: 'shopping',   label: 'Shopping',   color: '#A855F7' },
  { key: 'culture',    label: 'Kultur',     color: '#EC4899' },
]

interface FilterBarProps {
  activeTypes: string[]
  onTypeToggle: (type: string) => void
  onResetTypes: () => void
}

export default function FilterBar({ activeTypes, onTypeToggle, onResetTypes }: FilterBarProps) {
  if (activeTypes.length === 0) return null

  return (
    <div style={{
      position: 'absolute',
      top: 72,      // direkt unter der SearchBar (16px top + 44px height + 12px gap)
      left: 16,
      right: 16,
      zIndex: 20,
      display: 'flex',
      gap: 6,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {/* Reset-Tag */}
      <button
        onClick={onResetTypes}
        style={{
          padding: '5px 12px',
          borderRadius: 99,
          border: '2px solid #111827',
          background: '#111827',
          color: 'white',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        ✕ Alle
      </button>

      {/* Aktive Filter */}
      {activeTypes.map(key => {
        const type = LOCATION_TYPES.find(t => t.key === key)
        if (!type) return null
        return (
          <button
            key={key}
            onClick={() => onTypeToggle(key)}
            style={{
              padding: '5px 12px',
              borderRadius: 99,
              border: `2px solid ${type.color}`,
              background: type.color,
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {type.label} ✕
          </button>
        )
      })}
    </div>
  )
}