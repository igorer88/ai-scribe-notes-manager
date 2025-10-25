import { readFileSync } from 'node:fs'

import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
  VersioningType
} from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'

export const getAppMetadata = (
  packageFile = 'package.json'
): {
  name: string
  version: string
  description: string
  author: string
  private: boolean
  license: string
} => {
  try {
    const data = readFileSync(packageFile, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    throw error
  }
}

export function setup(app: INestApplication): INestApplication {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  )

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }]
  })

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  })

  app.use(helmet())

  const appMetadata = getAppMetadata()
  const config = new DocumentBuilder()
    .setTitle(appMetadata.name)
    .setDescription(appMetadata.description)
    .setVersion(appMetadata.version)
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  return app
}
