'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Location } from '@/types/location'
import LocationPreview from '@/components/map/location-detail/LocationPreview'
import LocationDetail from '@/components/map/location-detail/LocationDetail'

type SheetState = 'hidden' | 'preview' | 'expanded'

interface LocationSheetProps {
  location: Location | null
  onClose: () => void
}

const PREVIEW_HEIGHT = 120
const DRAG_THRESHOLD = 60

export default function LocationSheet({ location, onClose }: LocationSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('hidden')
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartY = useRef<number | null>(null)
  const sheetStateRef = useRef(sheetState)
  const onCloseRef = useRef(onClose)
  const [prevLocationId, setPrevLocationId] = useState(location?.location_id ?? null)

  // Location geändert → State zurücksetzen
  if (prevLocationId !== (location?.location_id ?? null)) {
    setPrevLocationId(location?.location_id ?? null)
    setSheetState(location ? 'preview' : 'hidden')
    setDragOffset(0)
  }

  useEffect(() => { sheetStateRef.current = sheetState }, [sheetState])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // useCallback ref — wird aufgerufen sobald das Element im DOM erscheint
  const handleRef = useCallback((el: HTMLDivElement | null) => {
    if (!el) return

    function onTouchStart(e: TouchEvent) {
      dragStartY.current = e.touches[0].clientY
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      if (dragStartY.current === null) return
      const delta = e.touches[0].clientY - dragStartY.current
      const state = sheetStateRef.current
      if (state === 'preview') setDragOffset(delta)
      if (state === 'expanded' && delta > 0) setDragOffset(delta)
    }

    function onTouchEnd() {
      if (dragStartY.current === null) return
      const state = sheetStateRef.current
      setDragOffset(prev => {
        if (state === 'preview') {
          if (prev < -DRAG_THRESHOLD) setSheetState('expanded')
          else if (prev > DRAG_THRESHOLD) onCloseRef.current()
        } else if (state === 'expanded') {
          if (prev > DRAG_THRESHOLD) setSheetState('preview')
        }
        return 0
      })
      dragStartY.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
  }, [])

  const isAnimating = dragOffset === 0
  const height = sheetState === 'expanded' ? '85vh' : PREVIEW_HEIGHT
  const translateY = sheetState === 'hidden' ? '100%' : `${Math.max(0, dragOffset)}px`

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        background: 'white',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        transform: `translateY(${translateY})`,
        transition: isAnimating ? 'transform 0.3s ease, height 0.3s ease' : 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        ref={handleRef}
        style={{
          padding: '12px 20px 8px',
          flexShrink: 0,
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <div style={{
          width: 36,
          height: 4,
          background: '#D1D5DB',
          borderRadius: 2,
          margin: '0 auto',
        }} />
      </div>

      {location && (
        <div style={{ flex: 1, overflow: 'auto' }}>
          {sheetState === 'preview'
            ? <LocationPreview location={location} onClose={onClose} />
            : <LocationDetail location={location} />
          }
        </div>
      )}
    </div>
  )
}