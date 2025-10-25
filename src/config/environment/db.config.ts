import { registerAs } from '@nestjs/config'

/**
 * Database configuration for the application.
 * This configuration supports any database driver,
 * add the specific configuration for each driver
 * in the respective object.
 *  e.g., mysql: { ... }
 */
export const dbConfig = registerAs('db', () => ({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD
}))

/** Folder to store the SQLite database file. */
export const dbFolder = 'config/db'
