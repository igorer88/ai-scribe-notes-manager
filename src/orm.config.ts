import { DataSource } from 'typeorm'

import { getValidationSchema } from './config/environment/validation.schema'

const { error, value: envVars } = getValidationSchema().validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: envVars.DB_HOST,
  port: parseInt(envVars.DB_PORT),
  database: envVars.DB_NAME,
  username: envVars.DB_USER,
  password: envVars.DB_PASSWORD,
  ssl: false,
  entities: [__dirname + '/**/**/*.entity{.ts,.js}'],
  migrations: ['./src/database/migrations/*{.ts,.js}'],
  migrationsTableName: '_migrations',
  synchronize: false
})

export { AppDataSource }
