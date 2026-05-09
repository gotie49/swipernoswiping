'use client'

import { LOCATION_TYPES } from '@/types/locationTypes'

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
      top: 72,
      left: 16,
      right: 16,
      zIndex: 20,
      display: 'flex',
      gap: 6,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
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