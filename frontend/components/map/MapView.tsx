'use client';

import * as React from 'react';
import { useState } from 'react'
import { Map } from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Location } from '@/types/location'
import LocationMarker from '@/components/map/LocationMarker'
import LocationSheet from '@/components/map/LocationSheet'
import { DUMMY_LOCATIONS } from '@/data/dummyLocations'

export default function MapView() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
 
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Map
        initialViewState={{
          longitude: 10.0010, // ITECH
          latitude: 53.5050,
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        onClick={() => setSelectedLocation(null)}
      >
        {DUMMY_LOCATIONS.map(location => (
          <LocationMarker
            key={location.location_id}
            location={location}
            isSelected={selectedLocation?.location_id === location.location_id}
            onClick={setSelectedLocation}
          />
        ))}
      </Map>

      <LocationSheet
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />

    </div>
  )
}
