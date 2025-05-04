import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GreenModule } from 'src/utils/green/green.module';
import { OpenAIModule } from 'src/utils/openai/openai.module';

@Module({
    providers: [TasksService],
    imports: [GreenModule,OpenAIModule],
})
export class TasksModule {}
