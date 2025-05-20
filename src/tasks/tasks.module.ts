import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GreenModule } from 'src/utils/green/green.module';
import { OpenAIModule } from 'src/utils/openai/openai.module';
import { MessageModule } from 'src/message/message.module';

@Module({
    providers: [TasksService],
    imports: [GreenModule, OpenAIModule, MessageModule],
    exports: [TasksService],
})
export class TasksModule {}
