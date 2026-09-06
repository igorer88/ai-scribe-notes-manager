import { DataSource } from 'typeorm'

import { getValidationSchema } from './config/environment/validation.schema'
import { getDatabaseCredentials } from './database/database.connector'

const { error, value: envVars } = getValidationSchema().validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const credentials = getDatabaseCredentials(envVars)

const AppDataSource = new DataSource({
  type: 'postgres',
  host: credentials.host,
  port: credentials.port,
  database: credentials.database,
  username: credentials.username,
  password: credentials.password,
  ssl: credentials.ssl,
  entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
  migrations: ['./src/database/migrations/*{.ts,.js}'],
  migrationsTableName: '_migrations',
  synchronize: false
})

export { AppDataSource }
