import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MessageModule } from 'src/message/message.module';

@Module({
    controllers: [CommentController],
    providers: [CommentService],
    imports: [MessageModule],
})
export class CommentModule {}
