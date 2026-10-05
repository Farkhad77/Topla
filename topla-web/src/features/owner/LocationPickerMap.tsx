import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import { BAKU_CENTER, createOsmMap, hasValidCoords, stadiumPinIcon } from '@/components/map/leaflet'
import { cn } from '@/utils/cn'

/** Koordinatlar 6 rəqəmdən artıq dəqiqliyə ehtiyac duymur (~10 sm). */
function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

/**
 * Stadion formasında yerin xəritədən seçilməsi: xəritəyə klik et və ya markeri
 * sürüşdür — koordinatlar `onPick` ilə formaya yazılır. Koordinat inputlarına
 * əl ilə dəyər yazılanda da marker həmin nöqtəyə köçür (ikitərəfli sinxron).
 */
export function LocationPickerMap({
  latitude,
  longitude,
  onPick,
  className,
}: {
  latitude: number
  longitude: number
  onPick: (latitude: number, longitude: number) => void
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  // Klik handler-i bir dəfə qoşulur — təzə onPick-i həmişə görsün deyə ref-də saxlanılır.
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = createOsmMap(containerRef.current, BAKU_CENTER, 11)
    map.on('click', (event: L.LeafletMouseEvent) => {
      onPickRef.current(round6(event.latlng.lat), round6(event.latlng.lng))
    })
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // Prop-lardan gələn koordinat markeri idarə edir (klik onPick → form → bura).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !hasValidCoords(latitude, longitude)) return

    const position: L.LatLngTuple = [latitude, longitude]

    if (!markerRef.current) {
      const marker = L.marker(position, { icon: stadiumPinIcon(), draggable: true })
      marker.on('dragend', () => {
        const point = marker.getLatLng()
        onPickRef.current(round6(point.lat), round6(point.lng))
      })
      marker.addTo(map)
      markerRef.current = marker
      map.setView(position, Math.max(map.getZoom(), 15))
      return
    }

    markerRef.current.setLatLng(position)
    // Marker görünüş sahəsindən çıxıbsa (məs. koordinat əl ilə dəyişilib) ona qayıt.
    if (!map.getBounds().contains(position)) {
      map.panTo(position)
    }
  }, [latitude, longitude])

  return (
    <div className={cn('space-y-1.5', className)}>
      {/* `relative z-0` vacibdir: Leaflet panelləri yüksək z-index işlədir və
          stacking context olmadan sticky header-in üstünə çıxırdı. */}
      <div
        ref={containerRef}
        className="relative z-0 h-64 w-full overflow-hidden rounded-md border border-line"
        role="application"
        aria-label="Stadionun yerini xəritədən seç"
      />
      <p className="text-xs text-ink-500">
        Xəritəyə klik et və ya markeri sürüşdür — koordinatlar avtomatik dolur.
      </p>
    </div>
  )
}
