export interface User {
  id: bigint
  uid: string
  password: string
  tokens: JSON
  created_at: Date
}
