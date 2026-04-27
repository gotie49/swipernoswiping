'use client'

import { useRouter } from 'next/navigation'
import MapWrapper from '@/components/MapWrapper'

export default function MapPage() {
  const router = useRouter()

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        zIndex: 10,
      }}>
        <button
          onClick={() => router.push('/search')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            cursor: 'text',
            fontSize: '15px',
            color: '#9e9e9e',
          }}
        >
          🔍 Suchen...
        </button>
      </div>

      <MapWrapper />
    </div>
  )
}