import { Injectable, Logger } from '@nestjs/common'
import { resolve, join } from 'path'
import { pathToFileURL } from 'url'
import type { Request, Response, NextFunction } from 'express'

type SsrHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

@Injectable()
export class SsrService {
  private readonly logger = new Logger(SsrService.name)
  private readonly browserDistFolder = resolve(process.cwd(), 'dist/client/browser')
  private ssrHandler: SsrHandler | null = null

  async initialize(expressApp: import('express').Application) {
    const { default: express } = await import('express')
    expressApp.use(express.static(this.browserDistFolder, {
      maxAge: '1y',
      index: false,
      setHeaders(res, path) {
        if (!/\.[a-f0-9]{8,}\.(js|css|mjs)$/.test(path)) {
          res.setHeader('Cache-Control', 'public, max-age=3600')
        }
      },
    }))

    try {
      const serverDir = resolve(process.cwd(), 'dist/client/server')
      const { default: handler } = await import(pathToFileURL(join(serverDir, 'server.mjs')).href)
      this.ssrHandler = handler
      this.logger.log('Angular SSR initialized')
    } catch (err) {
      this.logger.warn(`Angular SSR initialization failed: ${err}`)
    }
  }

  async render(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!this.ssrHandler) {
      res.status(503).send('SSR not available — run npm run build first')
      return
    }
    await this.ssrHandler(req, res, next)
  }
}
