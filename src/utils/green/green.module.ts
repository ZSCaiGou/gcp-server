import { Module } from '@nestjs/common';
import { GreenService } from './green.service';

@Module({
    providers: [GreenService],
    exports: [GreenService],
})
export class GreenModule {}
