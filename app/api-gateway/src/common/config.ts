import { config } from 'dotenv'
import { join } from 'path'

config()

export const loadEnv = (envPath: string): void => {
    const absolutePath = join(process.cwd(), envPath)
    const result = config({ path: absolutePath })

    console.log(`[LoadEnv] Loaded ${envPath}, DB_HOST: ${process.env.DB_HOST}`)

    if (result.error) {
        throw new Error(`Failed to load ${envPath}: ${result.error.message}`)
    }
}

export const appConfig = {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    isProduction: process.env.NODE_ENV === 'production',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
}

export const dbConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'postgres',
}

export const orchestratorConfig = {
    grpcUrl: process.env.ORCHESTRATOR_URL ?? 'localhost:50054',
}

export const minioConfig = {
    endPoint: process.env.MINIO_ENDPOINT ?? '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_SECRET_KEY ?? '',
    presignExpirySec: parseInt(process.env.MINIO_PRESIGN_EXPIRY_SEC ?? '3600', 10),
}

export const jwtConfig = {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET,
    accessTokenExpiresInLogin: process.env.EXPIRESIN_LOGIN ?? '1h',
    accessTokenExpiresRefreshInLogin: process.env.EXPIRESIN_REFRESH_LOGIN ?? '7d',
    accessTokenExpiresInRegister: process.env.EXPIRESIN_REGISTER,
    accessTokenExpiresInForgotPassword: process.env.EXPIRESIN_FORGOT_PASSWORD,
}
