import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { DataSource, EntityManager } from 'typeorm';
import { Game } from 'src/common/entity/game.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';

@Injectable()
export class GameService {
    private readonly manager: EntityManager;
    constructor(private readonly dataSource: DataSource) {
        this.manager = this.dataSource.manager;
    }

    async getGameTags() {
        // 获取根据热度排序的前15个游戏
        const games = await this.manager.find(Game, {
            order: {
                hot_point: 'DESC',
            },
            take: 15,
        });

        // 格式化数据
        const data = games.map((game) => {
            return {
                id: game.id,
                title: game.title,
                game_img_url: game.game_img_url,
                hot_point: game.hot_point,
            };
        });

        return Result.success(MessageConstant.SUCCESS, data);
    }
}
