export interface User {
  user_id: string
  name?: string        // optional — nicht im JWT
  email: string
  is_moderator: boolean
}
