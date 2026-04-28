'use client'

import { Marker } from '@vis.gl/react-maplibre'
import type { Location} from '@/types/location'

interface LocationMarkerProps {
  location: Location
  isSelected: boolean
  onClick: (poi: Location) => void
}

const TYPE_COLORS: Record<string, string> = {
  cafe:       '#F59E0B',
  restaurant: '#EF4444',
  park:       '#22C55E',
  sports:     '#3B82F6',
  shopping:   '#A855F7',
  culture:    '#EC4899',
}
 
const DEFAULT_COLOR = '#6B7280'
 
function getColor(type: string | null): string {
  return type ? (TYPE_COLORS[type] ?? DEFAULT_COLOR) : DEFAULT_COLOR
}

export default function LocationMarker({ location, isSelected, onClick }: LocationMarkerProps) {
  const typeColor = getColor(location.location_type)
  return (
    <Marker
      longitude={location.geom.coordinates[0]}
      latitude={location.geom.coordinates[1]}
      anchor="bottom"
      color={typeColor}
      onClick={e => {
        e.originalEvent.stopPropagation()
        onClick(location)
      }}
    >
    <div style={{
        width: isSelected ? 26: 18,
        height: isSelected ? 26: 18,
        borderRadius: '50%',
        background: typeColor,
        border: isSelected ? '3px solid white' : '2px solid white',
        boxShadow: isSelected
          ? `0 0 0 2px ${typeColor}, 0 2px 8px rgba(0,0,0,0.3)`
          : '0 1px 4px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }} />
    </Marker>
  )
}