import { Injectable, Logger } from '@nestjs/common'
import { existsSync, readFileSync } from 'fs'
import { resolve, join } from 'path'
import type { Request, Response, NextFunction } from 'express'

@Injectable()
export class SsrService {
  private readonly logger = new Logger(SsrService.name)
  private indexHtml: string | null = null
  private readonly browserDistFolder = resolve(process.cwd(), 'dist/client/browser')

  async initialize(expressApp: import('express').Application) {
    const { default: express } = await import('express')
    expressApp.use(express.static(this.browserDistFolder, { maxAge: '1y', index: false }))

    const indexPath = join(this.browserDistFolder, 'index.csr.html')
    if (existsSync(indexPath)) {
      this.indexHtml = readFileSync(indexPath, 'utf-8')
        .replace(/ media="print" onload="this\.media='all'"/g, '')
        .replace(/<noscript><link rel="stylesheet" href="[^"]+"><\/noscript>/g, '')
      this.logger.log('Angular client-side rendering initialized')
    } else {
      this.logger.warn('Angular browser build not found. Run `npm run build:client` first.')
    }
  }

  async render(req: Request, res: Response, _next: NextFunction): Promise<void> {
    if (!this.indexHtml) {
      res.status(200).set({ 'Content-Type': 'text/html' }).send(this.fallbackPage())
      return
    }
    res.status(200).set({ 'Content-Type': 'text/html' }).send(this.indexHtml)
  }

  private fallbackPage(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="UTF-8"><title>Platform</title></head>
  <body>
    <app-root>
      <p style="font-family:sans-serif;padding:2rem">
        Angular build not found. Run <code>npm run build:client</code> and restart the server.
      </p>
    </app-root>
  </body>
</html>`
  }
}
