import { Injectable, Logger } from '@nestjs/common'
import { existsSync } from 'fs'
import { resolve, join } from 'path'

@Injectable()
export class SsrService {
  private readonly logger = new Logger(SsrService.name)
  private renderFn: ((url: string) => Promise<string>) | null = null
  private readonly isProd = process.env.NODE_ENV === 'production'
  private readonly browserDistFolder = resolve(process.cwd(), 'dist/client/browser')
  private readonly serverDistFolder = resolve(process.cwd(), 'dist/client/server')

  async initialize(_expressApp: import('express').Application) {
    await this.initAngularSsr()
  }

  private async initAngularSsr() {
    const serverBundle = join(this.serverDistFolder, 'main.server.mjs')

    if (!existsSync(serverBundle)) {
      this.logger.warn(
        'Angular SSR bundle not found. Run `npm run build:client` first.',
      )
      return
    }

    const indexHtml = join(this.browserDistFolder, 'index.html')

    if (!existsSync(indexHtml)) {
      this.logger.warn('Angular browser build not found. Run `npm run build:client` first.')
      return
    }

    const { CommonEngine } = await import('@angular/ssr/node')
    const { default: bootstrap } = await import(serverBundle)
    const { APP_BASE_HREF } = await import('@angular/common')

    const engine = new CommonEngine()

    this.renderFn = async (url: string) => {
      return engine.render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `http://localhost${url}`,
        publicPath: this.browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: new URL(`http://localhost${url}`).pathname }],
      })
    }

    this.logger.log(
      `Angular SSR initialized in ${this.isProd ? 'production' : 'development'} mode`,
    )
  }

  async render(url: string): Promise<string> {
    if (!this.renderFn) {
      return this.fallbackPage()
    }

    try {
      return await this.renderFn(url)
    } catch (e) {
      this.logger.error(`SSR render error for ${url}`, e)
      throw e
    }
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
