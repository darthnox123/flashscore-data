import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node'

let angularApp: AngularNodeAppEngine | null = null

export default createNodeRequestHandler(async (req, res, next) => {
  angularApp ??= new AngularNodeAppEngine()
  const response = await angularApp.handle(req)
  if (response) {
    await writeResponseToNodeResponse(response, res)
  } else {
    next()
  }
})
