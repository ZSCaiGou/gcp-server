import { DataSource, EntityManager, Like,Raw } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { Game } from 'src/common/entity/game.entity';
import { UserContent } from 'src/common/entity/user_content.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';

@Injectable()
export class SearchService {
    private readonly manager: EntityManager;

    constructor(private readonly dataSource: DataSource) {
        this.manager = this.dataSource.manager;
    }

    // 获取综合搜索结果
    async getSearch(keyword: string) {
        // 获取相关游戏社区
        const games = await this.manager.find(Game, {
            where: {
                title: Like(`%${keyword}%`),
            },
        });
        // 获取标题包含关键字的用户内容
        const titleLikeContents = await this.manager.find(UserContent, {
            where: {
                title: Like(`%${keyword}%`),
            },
            order: {
                create_time: 'DESC',
            },
            take:20
        });
        // 获取内容包含关键字的用户内容
        const contentLikeContents = await this.manager.find(UserContent, {
            where: {
                content: Like(`%${keyword}%`),
            },
        });
        // 合并结果
        const result = [...games, ...titleLikeContents, ...contentLikeContents];
        return Result.success(MessageConstant.SUCCESS, result);
    }
    // 获取用户内容搜索结果
    async getUserContentSearch(user_id: string, keyword: string) {

    }
}
