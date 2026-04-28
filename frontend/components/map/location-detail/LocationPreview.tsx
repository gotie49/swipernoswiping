'use client'

import type { Location } from '@/types/location'

interface LocationPreviewProps {
  location: Location
  onClose: () => void
}

export default function LocationPreview({ location, onClose }: LocationPreviewProps) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '4px 20px 16px',
    }}>
      <div>
        <strong style={{ fontSize: 17 }}>{location.name}</strong>
        {location.address && (
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>
            {location.address}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 18,
          cursor: 'pointer',
          color: '#9CA3AF',
          padding: 0,
          lineHeight: 1,
          flexShrink: 0,
          marginLeft: 8,
        }}
      >
        ✕
      </button>
    </div>
  )
}