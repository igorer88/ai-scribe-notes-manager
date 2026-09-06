export interface DatabaseCredentials {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl: boolean | { rejectUnauthorized: boolean }
}
