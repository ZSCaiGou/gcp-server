import { Injectable } from '@nestjs/common';
import { CreateDataAnalysisDto } from './dto/create-data_analysis.dto';
import { UpdateDataAnalysisDto } from './dto/update-data_analysis.dto';
import { EntityManager, DataSource, Between } from 'typeorm';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import {
    ContentStatus,
    UserContent,
} from 'src/common/entity/user_content.entity';
import { User } from 'src/common/entity/user.entity';
import {
    Interaction,
    InteractionType,
} from 'src/common/entity/interaction.entity';
import { Comment } from 'src/common/entity/comment.entity';

@Injectable()
export class DataAnalysisService {
    private readonly manager: EntityManager;
    constructor(private readonly dataSource: DataSource) {
        this.manager = dataSource.manager;
    }
    async getRecent7DaysDataAnalysis(communityId: bigint) {
        // 获取社区7天内的发帖量
        const now = new Date(); // 硬编码当前时间
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - 6); // 包含今天的完整7天（15-21日）
        startDate.setHours(0, 0, 0, 0);

        // 2. 构建日期序列容器（预生成7天模板）
        const dateMap = new Map<string, number>();
        for (
            let d = new Date(startDate);
            d <= now;
            d.setDate(d.getDate() + 1)
        ) {
            dateMap.set(d.toISOString().slice(0, 10), 0); // 格式：2025-05-15
        }
        const dates = Array.from(dateMap.keys());
        for (let i = 0; i < dates.length; i++) {
            let start = new Date(dates[i]);
            start.setHours(0, 0, 0, 0);
            let end = new Date(start);
            end.setDate(end.getDate() + 1);
            const count = await this.manager.count(UserContent, {
                where: {
                    create_time: Between(start, end),
                    target_communities: {
                        id: communityId,
                    },
                },
                relations: ['target_communities'],
            });
            dateMap.set(dates[i], count);
        }
        // 获取今日的帖子数
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const todayCount = await this.manager.count(UserContent, {
            where: {
                create_time: Between(today, tomorrow),
                target_communities: {
                    id: communityId,
                },
            },
            relations: ['target_communities'],
        });
        // 获取未审核的帖子数
        const uncheckCount = await this.manager.count(UserContent, {
            where: {
                status: ContentStatus.PENDING,
                target_communities: {
                    id: communityId,
                },
            },
            relations: ['target_communities'],
        });
        // 3. 构建返回数据结构
        const result = {
            dates,
            data: Array.from(dateMap.values()),
            todayCount,
            uncheckCount,
        };
        return Result.success(MessageConstant.SUCCESS, result);
    }

    async getSystemDataAnalysis() {
        // 获取近6个月每个月的注册用户数
        const now = new Date(); // 硬编码当前时间
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6); // 包含当前月的完整6个月
        startDate.setHours(0, 0, 0, 0);

        // 2. 构建日期序列容器（预生成6个月模板）
        const dateMap = new Map<string, number>();
        for (
            let d = new Date(startDate);
            d <= now;
            d.setMonth(d.getMonth() + 1)
        ) {
            dateMap.set(d.toISOString().slice(0, 7), 0); // 格式：2025-05
        }
        const dates = Array.from(dateMap.keys());
        for (let i = 0; i < dates.length; i++) {
            let start = new Date(dates[i]);
            start.setHours(0, 0, 0, 0);
            let end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            const count = await this.manager.count(User, {
                where: {
                    create_time: Between(start, end),
                },
            });
            dateMap.set(dates[i], count);
        }
        // 获取总的评论数
        const commentCount = await this.manager.count(Comment);
        // 获取总的用户内容数
        const contentCount = await this.manager.count(UserContent);
        // 获取总的点赞数
        const likeCount = await this.manager.count(Interaction, {
            where: {
                type: InteractionType.LIKE,
            },
        });
        // 获取总的收藏数
        const collectCount = await this.manager.count(Interaction, {
            where: {
                type: InteractionType.COLLECT,
            },
        });
        // 获取总的用户数
        const userCount = await this.manager.count(User);
        // 3. 构建返回数据结构
        const result = {
            dates,
            data: Array.from(dateMap.values()),
            commentCount,
            contentCount,
            likeCount,
            collectCount,
            userCount,
        };
        return Result.success(MessageConstant.SUCCESS, result);
    }
}
