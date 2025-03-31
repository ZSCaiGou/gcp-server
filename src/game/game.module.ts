import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UserContentModule } from 'src/user_content/user_content.module';

@Module({
  controllers: [GameController],
  providers: [GameService],
  imports:[UserContentModule]
})
export class GameModule {}
