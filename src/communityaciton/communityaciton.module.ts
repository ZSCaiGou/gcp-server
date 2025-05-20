import { Module } from '@nestjs/common';
import { CommunityacitonService } from './communityaciton.service';
import { CommunityacitonController } from './communityaciton.controller';
import { MessageModule } from 'src/message/message.module';

@Module({
    controllers: [CommunityacitonController],
    providers: [CommunityacitonService],
    imports: [MessageModule],
})
export class CommunityacitonModule {}
