import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UserContentModule } from 'src/user_content/user_content.module';
import { OssUtilModule } from 'src/utils/oss-util/oss-util.module';
import { MessageModule } from 'src/message/message.module';

@Module({
    controllers: [GameController],
    providers: [GameService],
    imports: [UserContentModule, OssUtilModule, MessageModule],
})
export class GameModule {}
