'use client'

import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { Map, useMap } from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Location } from '@/types/location'
import LocationMarker from '@/components/map/LocationMarker/LocationMarker'
import LocationSheet from '@/components/map/LocationSheet/LocationSheet'
import SearchBar from '@/components/map/SearchBar/SearchBar'
import { DUMMY_LOCATIONS } from '@/data/dummyLocations'

function FlyToHandler({ location }: { location: Location | null }) {
  const { current: map } = useMap()

  useEffect(() => {
    if (!map || !location) return
    map.flyTo({
      center: [location.geom.coordinates[0], location.geom.coordinates[1]],
      zoom: 14,
      duration: 800,
    })
  }, [location, map])

  return null
}

export default function MapView() {
  const [viewState, setViewState] = useState({
    longitude: 10.0010,
    latitude: 53.5050,
    zoom: 14,
  })
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [activeTypes, setActiveTypes] = useState<string[]>([])

  function handleTypeToggle(type: string) {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function handleLocationSelect(location: Location) {
    setSelectedLocation(location)
  }

  const visibleLocations = useMemo(() =>
    activeTypes.length === 0
      ? DUMMY_LOCATIONS
      : DUMMY_LOCATIONS.filter(l => l.location_type && activeTypes.includes(l.location_type)),
    [activeTypes]
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Map
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        onClick={() => setSelectedLocation(null)}
      >
        <FlyToHandler location={selectedLocation} />

        {visibleLocations.map(location => (
          <LocationMarker
            key={location.location_id}
            location={location}
            isSelected={selectedLocation?.location_id === location.location_id}
            onClick={handleLocationSelect}
          />
        ))}
      </Map>

      <SearchBar
        locations={DUMMY_LOCATIONS}
        activeTypes={activeTypes}
        onTypeToggle={handleTypeToggle}
        onLocationSelect={handleLocationSelect}
      />

      <LocationSheet
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </div>
  )
}