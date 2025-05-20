import { Module } from '@nestjs/common';
import { RecomandService } from './recomand.service';
import { TasksModule } from 'src/tasks/tasks.module';

@Module({
    providers: [RecomandService],
    exports: [RecomandService],
    imports: [TasksModule],
})
export class RecommandModule {}
