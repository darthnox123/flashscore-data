import { Controller, Req, Res, All, Next } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { SsrService } from './ssr.service'

@Controller()
export class SsrController {
  constructor(private readonly ssrService: SsrService) {}

  @All('*')
  async render(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    await this.ssrService.render(req, res, next)
  }
}
