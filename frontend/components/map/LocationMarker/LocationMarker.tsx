'use client'

import { Marker } from '@vis.gl/react-maplibre'
import type { Location } from '@/types/location'
import { getColorForType } from '@/types/locationTypes'
import styles from './LocationMarker.module.css'

interface LocationMarkerProps {
  location: Location
  isSelected: boolean
  onClick: (poi: Location) => void
}

export default function LocationMarker({ location, isSelected, onClick }: LocationMarkerProps) {
  const typeColor = getColorForType(location.location_type ?? '')
  const size = isSelected ? 26 : 18

  return (
    <Marker
      longitude={location.geom.coordinates[0]}
      latitude={location.geom.coordinates[1]}
      anchor="bottom"
      onClick={e => {
        e.originalEvent.stopPropagation()
        onClick(location)
      }}
    >
      <div
        className={`${styles.marker} ${isSelected ? styles.markerSelected : ''}`}
        style={{
          width: size,
          height: size,
          background: typeColor,
          boxShadow: isSelected
            ? `0 0 0 2px ${typeColor}, 0 2px 8px rgba(0,0,0,0.3)`
            : '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </Marker>
  )
}