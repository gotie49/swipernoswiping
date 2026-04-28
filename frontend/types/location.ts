export interface Location {
  location_id: string
  name: string
  description: string | null
  geom: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  address: string | null
  location_type: string | null
  opening_hours: string | null
  status: string | null
  creator_user_id: string | null
}