import { AngularNodeAppEngine, createNodeRequestHandler, writeResponseToNodeResponse } from '@angular/ssr/node'

const angularApp = new AngularNodeAppEngine()

export default createNodeRequestHandler(async (req, res, next) => {
  const response = await angularApp.handle(req)
  if (response) {
    await writeResponseToNodeResponse(response, res)
  } else {
    next()
  }
})
