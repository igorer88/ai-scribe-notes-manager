import { DatabaseCredentials } from './interfaces/database-credentials.interface'

const SSL_ENABLED_MODES = new Set([
  'require',
  'required',
  'verify-ca',
  'verify-full',
  'prefer'
])

const SSL_FALSE_TOKENS = new Set(['false', '0', 'no', 'none', 'disable'])

const resolveSsl = (
  override: boolean | undefined,
  sslMode: string | null
): DatabaseCredentials['ssl'] => {
  const enabled =
    override !== undefined
      ? override
      : sslMode !== null && SSL_ENABLED_MODES.has(sslMode.toLowerCase())

  return enabled ? { rejectUnauthorized: false } : false
}

const parseSslOverride = (value: string | undefined): boolean | undefined => {
  if (value === undefined) return undefined
  return !SSL_FALSE_TOKENS.has(value.toLowerCase())
}

const parseDatabaseUrl = (
  databaseUrl: string,
  env: NodeJS.ProcessEnv
): DatabaseCredentials => {
  const url = new URL(databaseUrl)

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 5432,
    database: url.pathname.replace(/^\//, ''),
    username: url.username ? decodeURIComponent(url.username) : '',
    password: url.password ? decodeURIComponent(url.password) : '',
    ssl: resolveSsl(
      parseSslOverride(env.DB_SSL),
      url.searchParams.get('sslmode')
    )
  }
}

const parseDatabaseParts = (env: NodeJS.ProcessEnv): DatabaseCredentials => {
  const parts: [string, string | undefined][] = [
    ['DB_HOST', env.DB_HOST],
    ['DB_NAME', env.DB_NAME],
    ['DB_USER', env.DB_USER],
    ['DB_PASSWORD', env.DB_PASSWORD]
  ]

  const missing = parts.filter(([, value]) => !value).map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Missing database configuration: ${missing.join(', ')} (provide DATABASE_URL or the individual DB_* variables)`
    )
  }

  return {
    host: env.DB_HOST as string,
    port: parseInt(env.DB_PORT || '5432', 10),
    database: env.DB_NAME as string,
    username: env.DB_USER as string,
    password: env.DB_PASSWORD as string,
    ssl: resolveSsl(parseSslOverride(env.DB_SSL), null)
  }
}

export const getDatabaseCredentials = (
  env: NodeJS.ProcessEnv = process.env
): DatabaseCredentials => {
  return env.DATABASE_URL
    ? parseDatabaseUrl(env.DATABASE_URL, env)
    : parseDatabaseParts(env)
}
