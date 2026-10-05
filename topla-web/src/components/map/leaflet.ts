import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Leaflet + OpenStreetMap — açar və ödəniş tələb etməyən xəritə həlli.
 * Bütün xəritələr bu köməkçilərdən keçir ki, görünüş və davranış vahid qalsın.
 */

/** Bakının mərkəzi — koordinat seçilməyibsə xəritə buradan başlayır. */
export const BAKU_CENTER: L.LatLngTuple = [40.4093, 49.8671]

export function hasValidCoords(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    (latitude !== 0 || longitude !== 0) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  )
}

/**
 * Brend rəngli marker. Leaflet-in default ikonu bundler-lərdə şəkil yolu
 * problemi yaradır (404 marker-icon.png) — divIcon + inline SVG bunu tam
 * aradan qaldırır.
 */
export function stadiumPinIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44" aria-hidden="true">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10.8 13.05 25.53 15.06 27.73a1.27 1.27 0 0 0 1.88 0C18.95 41.53 32 26.8 32 16 32 7.16 24.84 0 16 0Z" fill="#15803d"/>
      <circle cx="16" cy="16" r="6.5" fill="#fff"/>
      <circle cx="16" cy="16" r="3" fill="#15803d"/>
    </svg>`,
    iconSize: [32, 44],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  })
}

/** OSM tile qatı ilə hazır xəritə. Səhifə sürüşərkən xəritəyə "ilişməmək" üçün
 * scroll zoom bağlıdır — istifadəçi +/- düymələri və barmaq jestləri ilə yaxınlaşdırır. */
export function createOsmMap(
  container: HTMLElement,
  center: L.LatLngTuple,
  zoom: number,
): L.Map {
  const map = L.map(container, {
    center,
    zoom,
    scrollWheelZoom: false,
    zoomControl: true,
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">OpenStreetMap</a>',
  }).addTo(map)

  return map
}
