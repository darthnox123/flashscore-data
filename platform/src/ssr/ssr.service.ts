import { Injectable, Logger } from '@nestjs/common'
import { resolve } from 'path'
import type { Request, Response, NextFunction } from 'express'

type SsrHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

@Injectable()
export class SsrService {
  private readonly logger = new Logger(SsrService.name)
  private readonly browserDistFolder = resolve(process.cwd(), 'dist/client/browser')
  private ssrHandler: SsrHandler | null = null

  async initialize(expressApp: import('express').Application) {
    const { default: express } = await import('express')
    expressApp.use(express.static(this.browserDistFolder, { maxAge: '1y', index: false }))

    try {
      const serverEntryPath = resolve(process.cwd(), 'dist/client/server/server.mjs')
      const { default: handler } = await import(serverEntryPath)
      this.ssrHandler = handler
      this.logger.log('Angular SSR initialized')
    } catch (err) {
      this.logger.warn(`Angular SSR bundle not found at dist/client/server/server.mjs: ${err}`)
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
