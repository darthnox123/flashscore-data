import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { SsrService } from './ssr/ssr.service'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.enableCors({ origin: 'https://teu-dominio.com', credentials: true })

  const ssrService = app.get(SsrService)
  await ssrService.initialize(app.getHttpAdapter().getInstance())

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.log(`Application running on http://localhost:${port}`)
}

bootstrap()
