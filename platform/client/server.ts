import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

let angularApp: AngularNodeAppEngine | null = null

async function getApp(): Promise<AngularNodeAppEngine> {
  if (!angularApp) {
    const dir = dirname(fileURLToPath(import.meta.url))
    const toUrl = (f: string) => pathToFileURL(join(dir, f)).href
    await import(/* webpackIgnore: true */ toUrl('angular-app-manifest.mjs'))
    await import(/* webpackIgnore: true */ toUrl('angular-app-engine-manifest.mjs'))
    angularApp = new AngularNodeAppEngine()
  }
  return angularApp
}

export default createNodeRequestHandler(async (req, res, next) => {
  const app = await getApp()
  const response = await app.handle(req)
  if (response) {
    await writeResponseToNodeResponse(response, res)
  } else {
    next()
  }
})
