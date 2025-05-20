import { DataSource, EntityManager, In, Like, Raw } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { Game } from 'src/common/entity/game.entity';
import {
    ContentStatus,
    UserContent,
} from 'src/common/entity/user_content.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { User, UserStatus } from 'src/common/entity/user.entity';

@Injectable()
export class SearchService {
    private readonly manager: EntityManager;

    constructor(private readonly dataSource: DataSource) {
        this.manager = this.dataSource.manager;
    }

    // 获取综合搜索结果
    async getSearch(keyword: string) {
        let contentResults: UserContent[] = [];
        let userResults: User[] = [];

        // 获取游戏内容关联的社区名包含关键字的结果
        const ct = await this.manager.find(UserContent, {
            where: {
                target_communities: {
                    title: Like(`%${keyword}%`),
                },
            },
            relations: ['target_communities', 'user', 'target_topics'],
        });
        contentResults.push(...ct);
        // 获取游戏内容标题包含关键字的结果
        const ct2 = await this.manager.find(UserContent, {
            where: {
                title: Like(`%${keyword}%`),
            },
            relations: ['target_communities', 'user', 'target_topics'],
        });
        // 合并两个结果
        ct2.forEach((item) => {
            if (!contentResults.some((item2) => item2.id === item.id)) {
                contentResults.push(item);
            }
        });
        // 获取游戏内容内容包含关键字的结果
        const ct3 = await this.manager.find(UserContent, {
            where: {
                content: Like(`%${keyword}%`),
            },
            relations: ['target_communities', 'user', 'target_topics'],
        });
        // 合并两个结果
        ct3.forEach((item) => {
            if (!contentResults.some((item2) => item2.id === item.id)) {
                contentResults.push(item);
            }
        });
        // 获取游戏话题包含关键字的结果
        const ct4 = await this.manager.find(UserContent, {
            where: {
                target_topics: {
                    title: Like(`%${keyword}%`),
                },
            },
            relations: ['target_communities', 'user', 'target_topics'],
        });
        // 合并两个结果
        ct4.forEach((item) => {
            if (!contentResults.some((item2) => item2.id === item.id)) {
                contentResults.push(item);
            }
        });
        // 获取用户名包含关键字的结果
        const u = await this.manager.find(User, {
            where: {
                username: Like(`%${keyword}%`),
            },
        });
        userResults.push(...u);
        // 获取用户昵称包含关键字的结果
        const u2 = await this.manager.find(User, {
            where: {
                profile: {
                    nickname: Like(`%${keyword}%`),
                },
            },
        });
        // 合并两个结果
        u2.forEach((item) => {
            if (!userResults.some((item2) => item2.id === item.id)) {
                userResults.push(item);
            }
        });
        // 最后筛选出状态正确的结果
        contentResults = contentResults.filter(
            (item) => item.status === ContentStatus.APPROVED,
        );
        userResults = userResults.filter(
            (item) => item.status === UserStatus.ACTIVE,
        );
        return Result.success(MessageConstant.SUCCESS, {
            content: contentResults.map((content) => {
                return {
                    id: content.id,
                    title: content.title,
                    cover_url: content.cover_url,
                    create_time: content.create_time,
                    content: content.content,
                    type: content.type,
                    user_info: {
                        id: content.user.id,
                        nickname: content.user.profile.nickname
                            ? content.user.profile.nickname
                            : content.user.username,
                        avatar_url: content.user.profile.avatar_url,
                        level: content.user.level.level,
                    },
                    game_tags: content.target_communities.map((game) => ({
                        id: game.id,
                        title: game.title,
                        game_img_url: game.game_img_url,
                    })),
                    topic_tags: content.target_topics.map((topic) => ({
                        id: topic.id,
                        title: topic.title,
                    })),
                };
            }),
            user: userResults.map((user) => ({
                id: user.id,
                avatar_url: user.profile.avatar_url,
                username: user.username,
                nickname: user.profile.nickname,
                signature: user.profile.bio?.signature || '',
            })),
        });
    }
    // 获取用户内容搜索结果
    async getUserContentSearch(user_id: string, keyword: string) {}
}
