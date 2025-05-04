import { Module } from '@nestjs/common';
import { SafeService } from './safe.service';
import { SafeController } from './safe.controller';
import { SmtpModule } from 'src/utils/smtp/smtp.module';

@Module({
  controllers: [SafeController],
  providers: [SafeService],
  imports:[
    SmtpModule
  ]
})
export class SafeModule {}
