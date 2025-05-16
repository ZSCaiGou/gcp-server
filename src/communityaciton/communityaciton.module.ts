import { Module } from '@nestjs/common';
import { CommunityacitonService } from './communityaciton.service';
import { CommunityacitonController } from './communityaciton.controller';

@Module({
    controllers: [CommunityacitonController],
    providers: [CommunityacitonService],
})
export class CommunityacitonModule {}
