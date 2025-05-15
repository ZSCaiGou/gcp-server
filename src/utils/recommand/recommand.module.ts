
import { Module } from '@nestjs/common';
import { RecomandService } from './recomand.service';

@Module({
    providers: [RecomandService],
    exports: [RecomandService],
})
export class RecommandModule {}