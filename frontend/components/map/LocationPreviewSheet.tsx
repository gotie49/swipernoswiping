'use client'

import type { Location } from '@/types/location'

interface LocationPreviewSheetProps {
  location: Location | null
  onClose: () => void
}

export default function LocationPreviewSheet({ location, onClose }: LocationPreviewSheetProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        padding: '16px 20px 32px',
        transform: location ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s ease',
        zIndex: 10,
      }}
    >
      {/* Drag Handle */}
      <div
        style={{
          width: 36,
          height: 4,
          background: '#D1D5DB',
          borderRadius: 2,
          margin: '0 auto 16px',
        }}
      />

      {location && (
        <>
          <strong style={{ fontSize: 18 }}>{location.name}</strong>

          {location.address && (
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>
              {location.address}
            </p>
          )}

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#9CA3AF',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </>
      )}
    </div>
  )
}