import { Controller, Get, Req, Res, All } from '@nestjs/common'
import { Request, Response } from 'express'
import { SsrService } from './ssr.service'

@Controller()
export class SsrController {
  constructor(private readonly ssrService: SsrService) {}

  @All('*')
  async render(@Req() req: Request, @Res() res: Response) {
    const html = await this.ssrService.render(req.originalUrl)
    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  }
}
