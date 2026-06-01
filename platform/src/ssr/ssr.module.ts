import { Module } from '@nestjs/common'
import { SsrService } from './ssr.service'
import { SsrController } from './ssr.controller'

@Module({
  providers: [SsrService],
  controllers: [SsrController],
  exports: [SsrService],
})
export class SsrModule {}
