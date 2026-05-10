'use client'

import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import { Map, Marker, useMap } from '@vis.gl/react-maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Location } from '@/types/location'
import LocationMarker from '@/components/map/LocationMarker/LocationMarker'
import LocationSheet from '@/components/map/LocationSheet/LocationSheet'
import SearchBar from '@/components/map/SearchBar/SearchBar'
import FilterBar from '@/components/map/FilterBar/FilterBar'
import { DUMMY_LOCATIONS } from '@/data/dummyLocations'

const HAMBURG_WILHELMSBURG = {
  longitude: 10.0010,
  latitude: 53.5050,
}

const NEARBY_DISTANCE_METERS = 5000

function nullString(val: unknown): string | null {
  if (val && typeof val === 'object' && 'String' in val && 'Valid' in val) {
    const v = val as { String: string; Valid: boolean }
    return v.Valid ? v.String : null
  }
  return typeof val === 'string' ? val : null
}

type NearbyLocationResponse = {
  location_id: string
  name: string
  description: unknown
  address: unknown
  location_type: unknown
  opening_hours: unknown
  status: unknown
  creator_user_id: string | null
  average_rating: unknown
  lng: number
  lat: number
}

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
    ...HAMBURG_WILHELMSBURG,
    zoom: 14,
  })
  const [locations, setLocations] = useState<Location[]>(DUMMY_LOCATIONS)
  const [userLocation, setUserLocation] = useState<{ longitude: number; latitude: number } | null>({
    longitude: 10.0010,
    latitude: 53.5090,
  })
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [activeTypes, setActiveTypes] = useState<string[]>([])

  useEffect(() => {
    async function loadNearby(lat: number, lng: number) {
      try {
        const res = await fetch(
          `/api/locations/nearby?lat=${lat}&lng=${lng}&distance=${NEARBY_DISTANCE_METERS}`
        )
        if (!res.ok) {
          console.warn('Unable to load nearby locations:', res.statusText)
          setLocations(DUMMY_LOCATIONS)
          return
        }

        const data: NearbyLocationResponse[] | null = await res.json()
        if (!data) {
          setLocations(DUMMY_LOCATIONS)
          return
        }

        setLocations(data.map(item => {
          const openingHours =
            typeof item.opening_hours === 'string'
              ? item.opening_hours
              : item.opening_hours != null
                ? JSON.stringify(item.opening_hours)
                : null

          return {
            location_id: item.location_id,
            name: item.name,
            description: nullString(item.description),
            geom: {
              type: 'Point' as const,
              coordinates: [item.lng, item.lat] as [number, number],
            },
            address: nullString(item.address),
            location_type: nullString(item.location_type),
            opening_hours: openingHours,
            status: nullString(item.status),
            creator_user_id: item.creator_user_id,
          }
        }))
      } catch (error) {
        console.warn('Unable to load nearby locations:', error)
        setLocations(DUMMY_LOCATIONS)
      }
    }

    loadNearby(HAMBURG_WILHELMSBURG.latitude, HAMBURG_WILHELMSBURG.longitude)

    /*if (!navigator?.geolocation) return

    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        }
        setUserLocation(coords)
        setViewState(prev => ({
          ...prev,
          ...coords,
          zoom: 14,
        }))
        loadNearby(coords.latitude, coords.longitude)
      },
      error => {
        console.warn('Unable to read user location:', error.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )*/
  }, [])

  function handleTypeToggle(type: string) {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  function handleResetTypes() {
    setActiveTypes([])
  }

  function handleLocationSelect(location: Location) {
    setSelectedLocation(location)
  }

  const visibleLocations = useMemo(() =>
    activeTypes.length === 0
      ? locations
      : locations.filter(l => l.location_type && activeTypes.includes(l.location_type)),
    [activeTypes, locations]
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
        {userLocation && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#1D4ED8',
                boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.25)',
                border: '2px solid rgba(255,255,255,0.95)',
              }}
            />
          </Marker>
        )}
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
        locations={locations}
        activeTypes={activeTypes}
        onTypeToggle={handleTypeToggle}
        onResetTypes={handleResetTypes}
        onLocationSelect={handleLocationSelect}
      />

      <FilterBar
        activeTypes={activeTypes}
        onTypeToggle={handleTypeToggle}
        onResetTypes={handleResetTypes}
      />

      <LocationSheet
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />
    </div>
  )
}