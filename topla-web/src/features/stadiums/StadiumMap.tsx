import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import { ExternalLink, MapPin } from 'lucide-react'
import { createOsmMap, hasValidCoords, stadiumPinIcon } from '@/components/map/leaflet'

/**
 * Stadion detal səhifəsinin xəritəsi: Leaflet + OpenStreetMap (açarsız, pulsuz).
 * Koordinat 0,0 və ya yanlışdırsa xəritə göstərilmir — yalnız ünvan qalır.
 */
export function StadiumMap({
  latitude,
  longitude,
  address,
  name,
}: {
  latitude: number
  longitude: number
  address: string
  name: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const valid = hasValidCoords(latitude, longitude)

  useEffect(() => {
    if (!valid || !containerRef.current || mapRef.current) return

    const position: L.LatLngTuple = [latitude, longitude]
    const map = createOsmMap(containerRef.current, position, 16)
    L.marker(position, { icon: stadiumPinIcon() })
      .addTo(map)
      .bindPopup(`<strong>${name.replace(/</g, '&lt;')}</strong>`)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [valid, latitude, longitude, name])

  if (!valid) {
    return (
      <div className="flex items-start gap-2.5 rounded-md border border-line bg-ink-50 px-4 py-3.5 text-[13px] text-ink-600">
        <MapPin className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
        <span>{address || 'Ünvan göstərilməyib'}</span>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-line">
      {/* `relative z-0`: Leaflet-in daxili z-index-ləri sticky header-i örtməsin. */}
      <div
        ref={containerRef}
        className="relative z-0 h-56 w-full sm:h-64"
        role="application"
        aria-label={`${name} xəritədə`}
      />
      <div className="flex items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3">
        <p className="flex items-start gap-2 text-[13px] text-ink-700">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
          {address}
        </p>
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
        >
          Xəritədə aç
          <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  )
}
