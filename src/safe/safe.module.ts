import { Module } from '@nestjs/common';
import { SafeService } from './safe.service';
import { SafeController } from './safe.controller';
import { SmtpModule } from 'src/utils/smtp/smtp.module';
import { MessageModule } from 'src/message/message.module';

@Module({
    controllers: [SafeController],
    providers: [SafeService],
    imports: [SmtpModule, MessageModule],
})
export class SafeModule {}
