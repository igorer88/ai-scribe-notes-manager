import { User } from '@/domain/user/entities/user.entity'

export interface AuthResponse {
  accessToken: string
  user: User
}
