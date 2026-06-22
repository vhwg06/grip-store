export interface User {
  id: string
  username: string | null
  email: string | null
  avatar_url: string | null
  trustLevel: number
  isAdmin: boolean
  desktopNotificationsEnabled: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthSession {
  user: User
  tokens: AuthTokens
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: User
}
