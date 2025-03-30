import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GreenModule } from 'src/utils/green/green.module';

@Module({
    providers: [TasksService],
    imports: [GreenModule],
})
export class TasksModule {}
