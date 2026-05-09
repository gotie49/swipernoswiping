export interface LocationType {
  key: string
  label: string
  color: string
}
 
export const LOCATION_TYPES: LocationType[] = [
  { key: 'cafe',       label: 'Café',       color: '#F59E0B' },
  { key: 'restaurant', label: 'Restaurant', color: '#EF4444' },
  { key: 'park',       label: 'Natur',      color: '#22C55E' },
  { key: 'sports',     label: 'Sport',      color: '#3B82F6' },
  { key: 'shopping',   label: 'Shopping',   color: '#A855F7' },
  { key: 'culture',    label: 'Kultur',     color: '#EC4899' },
]
 
export function getLabelForType(key: string): string {
  return LOCATION_TYPES.find(t => t.key === key)?.label ?? key
}
 
export function getColorForType(key: string): string {
  return LOCATION_TYPES.find(t => t.key === key)?.color ?? '#6B7280'
}
