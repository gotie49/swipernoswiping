'use client'

import type { Location } from '@/types/location'

interface LocationDetailProps {
  location: Location
}

// Beispiel-Bewertungen
const EXAMPLE_RATINGS = [
  { user: 'Anna K.', stars: 5, comment: 'Absolut empfehlenswert, sehr schöner Ort!' },
  { user: 'Max M.', stars: 4, comment: 'Schöne Atmosphäre, kann ich nur empfehlen.' },
  { user: 'Julia S.', stars: 3, comment: 'Ganz okay, aber zur Stoßzeit sehr voll.' },
]

function Stars({ count }: { count: number }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: 14 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

export default function LocationDetail({ location }: LocationDetailProps) {
  return (
    <div style={{ padding: '4px 20px 40px' }}>

      {/* Name & Typ */}
      <strong style={{ fontSize: 20 }}>{location.name}</strong>
      {location.location_type && (
        <span style={{
          marginLeft: 8,
          fontSize: 12,
          background: '#F3F4F6',
          color: '#6B7280',
          padding: '2px 8px',
          borderRadius: 99,
        }}>
          {location.location_type}
        </span>
      )}

      {/* Basis-Infos */}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {location.address && (
          <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
            📍 {location.address}
          </p>
        )}
        {location.opening_hours && (
          <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
            🕐 {location.opening_hours}
          </p>
        )}
        {location.description && (
          <p style={{ margin: 0, fontSize: 14, color: '#374151', marginTop: 4 }}>
            {location.description}
          </p>
        )}
      </div>

      <hr style={{ margin: '16px 0', borderColor: '#F3F4F6' }} />

      {/* Bewertungen — Beispielinhalt */}
      <strong style={{ fontSize: 15 }}>Bewertungen</strong>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EXAMPLE_RATINGS.map((r, i) => (
          <div key={i} style={{
            background: '#F9FAFB',
            borderRadius: 10,
            padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{r.user}</span>
              <Stars count={r.stars} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>{r.comment}</p>
          </div>
        ))}
      </div>

      <hr style={{ margin: '16px 0', borderColor: '#F3F4F6' }} />

      {/* Kommentar abschicken — Beispielinhalt */}
      <strong style={{ fontSize: 15 }}>Kommentar hinterlassen</strong>
      <textarea
        placeholder="Dein Kommentar..."
        rows={3}
        style={{
          display: 'block',
          width: '100%',
          marginTop: 8,
          padding: '10px 12px',
          fontSize: 14,
          border: '1px solid #E5E7EB',
          borderRadius: 10,
          resize: 'none',
          boxSizing: 'border-box',
          outline: 'none',
        }}
      />
      <button
        style={{
          marginTop: 8,
          width: '100%',
          padding: '10px 0',
          background: '#3B82F6',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Absenden
      </button>
    </div>
  )
}