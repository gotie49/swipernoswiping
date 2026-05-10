import { useState, useEffect, useRef } from 'react'
import type { Comment } from '@/types/comment'

interface LocationDetail {
  location_id: string
  name: string
  description: string | null
  address: string | null
  location_type: string | null
  opening_hours: unknown
  status: string | null
  average_rating: number | null
  lat: number
  lng: number
}

interface UseLocationDetailResult {
  detail: LocationDetail | null
  comments: Comment[]
  isLoading: boolean
  error: string | null
  reload: () => void
}

function nullString(val: unknown): string | null {
  if (val && typeof val === 'object' && 'String' in val && 'Valid' in val) {
    const v = val as { String: string; Valid: boolean }
    return v.Valid ? v.String : null
  }
  return typeof val === 'string' ? val : null
}

function nullFloat(val: unknown): number | null {
  if (val && typeof val === 'object' && 'Float64' in val && 'Valid' in val) {
    const v = val as { Float64: number; Valid: boolean }
    return v.Valid ? v.Float64 : null
  }
  return typeof val === 'number' ? val : null
}

export function useLocationDetail(locationId: string | null): UseLocationDetailResult {
  const [detail, setDetail] = useState<LocationDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    if (!locationId) return

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const [locationRes, commentsRes] = await Promise.all([
          fetch(`/api/locations/${locationId}`),
          fetch(`/api/locations/${locationId}/comments`),
        ])

        const locationData = await locationRes.json()
        const commentsData = await commentsRes.json()

        setDetail({
          location_id: locationData.location_id,
          name: locationData.name,
          description: nullString(locationData.description),
          address: nullString(locationData.address),
          location_type: nullString(locationData.location_type),
          opening_hours: locationData.opening_hours,
          status: nullString(locationData.status),
          average_rating: nullFloat(locationData.average_rating),
          lat: locationData.lat,
          lng: locationData.lng,
        })
        setComments(commentsData ?? [])
      } catch {
        setError('Daten konnten nicht geladen werden')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [locationId, reloadCount])

  function reload() {
    setReloadCount(c => c + 1)
  }

  return { detail, comments, isLoading, error, reload }
}