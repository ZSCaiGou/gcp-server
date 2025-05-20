import { MessageService } from './../message/message.service';
import { OpenAIService } from './../utils/openai/openai.service';
import {
    TextModerationResponse,
    TextModerationPlusResponse,
} from '@alicloud/green20220302';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import Redis from 'ioredis';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';
import { Comment, CommentStatus } from 'src/common/entity/comment.entity';
import { Game } from 'src/common/entity/game.entity';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';
import { NotificationType } from 'src/common/entity/notification.entity';
import { User, UserStatus } from 'src/common/entity/user.entity';
import {
    ContentStatus,
    UserContent,
} from 'src/common/entity/user_content.entity';
import { UserViewHistory } from 'src/common/entity/user_view_history.entity';
import { GreenService } from 'src/utils/green/green.service';
import { DataSource, EntityManager, In } from 'typeorm';

type BehaviorType = 'view' | 'like' | 'collect' | 'comment' | 'share';
export interface UserBehavior {
    user_id: string;
    item_id: bigint;
    behavior_type: BehaviorType;
    weight: number; // 权重
    timeStamp: Date;
    social_links: string[]; // 社交关系
}

export interface ContentFearure {
    item_id: bigint;
    tags: string[]; // 标签
    popularity: number; // 实时热度值
    creator_id: string; // 创建者id
}

@Injectable()
export class TasksService {
    private readonly manager: EntityManager;
    private readonly logger = new Logger(TasksService.name);
    constructor(
        private readonly greenService: GreenService,
        private readonly dataSouce: DataSource,
        private readonly openAIService: OpenAIService,
        @InjectRedis() private readonly redisClient: Redis,
        private readonly messageService: MessageService,
    ) {
        this.manager = this.dataSouce.manager;
    }
    // 每隔 10s 检测一次内容
    @Interval(10000)
    async handleCheckContent() {
        this.logger.log('开始检测内容');
        const userContentList = await this.manager.find(UserContent, {
            where: {
                status: ContentStatus.PENDING,
            },
            order: {
                create_time: 'ASC',
            },
            take: 80,
            relations: ['user'],
        });
        if (userContentList.length === 0) {
            this.logger.log('没有待检测内容');
            return;
        }
        userContentList.forEach(async (userContent) => {
            if (userContent) {
                const content = userContent.content;
                const result = await this.openAIService.contetnReview(content);
                if (!result) {
                    this.logger.log('内容审核失败');
                    return;
                }
                if (result.level === 'none') {
                    userContent.status = ContentStatus.APPROVED;
                    userContent.check_result = result.reason;

                    // #TODO 增加积分奖励
                } else {
                    userContent.check_result = result.reason;
                    userContent.status = ContentStatus.REJECTED;
                }
                await this.manager.save(userContent);
                const mesContent = `您发布的内容 ${userContent.title} 审核结果为：${result.reason}`;
                await this.messageService.createMessage(
                    NotificationType.SYSTEM,
                    mesContent,
                    userContent.user,
                );
            } else {
                this.logger.log('没有待检测内容');
            }
        });
    }
    // 每周一凌晨 00:00 减少社区热度为原来的80%
    @Cron(CronExpression.EVERY_WEEK)
    async handleWeeklyDecreaseeCommunityHotPoint() {
        this.logger.log('开始减少社区热度');
        const communityList = await this.manager.find(Game, {
            order: {
                created_at: 'ASC',
            },
        });
        if (communityList.length === 0) {
            this.logger.log('没有待减少热度的社区');
            return;
        }
        communityList.map((community) => {
            if (community.hot_point > 0) {
                community.hot_point = Math.floor(community.hot_point * 0.8);
            }
        });
        await this.manager.save(communityList);
        this.logger.log('减少社区热度完成');
    }

    // 定时任务每两小时执行一次，从数据库中获取推荐系统的基础数据
    @Cron(CronExpression.EVERY_2_HOURS)
    // @Interval(5000)
    async handleGetRecommendBaseData() {
        this.logger.log('开始获取推荐系统的基础数据');
        this.logger.log('获取用户行为数据');
        const userBehaviors: UserBehavior[] = [];
        const allInteractions = await this.manager.find(Interaction, {
            relations: ['user'],
            where: {
                target_type: TargetType.CONTENT,
            },
        });
        // 点赞和收藏的行为
        userBehaviors.push(
            ...allInteractions.map((it) => {
                return {
                    user_id: it.user.id,
                    item_id: it.target_id,
                    behavior_type: it.type as BehaviorType,
                    weight: it.type === InteractionType.LIKE ? 3 : 5, // 社区互动的结果只有点赞和收藏，权重为3和5
                    timeStamp: it.created_at,
                    social_links: [],
                };
            }),
        );
        // 评论的行为
        const comments = await this.manager.find(Comment, {
            where: {
                status: CommentStatus.NORMAL,
                parent_id: -1 as unknown as bigint,
            },
            relations: ['user', 'target_content'],
        });
        userBehaviors.push(
            ...comments.map((comment) => {
                return {
                    user_id: comment.user.id,
                    item_id: comment.target_content.id,
                    behavior_type: 'comment' as BehaviorType,
                    weight: 2, // 评论的权重为2
                    timeStamp: comment.created_at,
                    social_links: [],
                };
            }),
        );
        // 浏览的行为
        const userHistoryList = await this.manager.find(UserViewHistory);
        userBehaviors.push(
            ...userHistoryList.map((history) => {
                return {
                    user_id: history.user.id,
                    item_id: history.user_content_id,
                    behavior_type: 'view' as BehaviorType,
                    weight: 1, // 浏览的权重为1
                    timeStamp: history.view_time,
                    social_links: [],
                };
            }),
        );
        this.logger.log('获取用户行为数据完成');
        this.logger.log('获取内容特征数据');
        const contentFeatures: ContentFearure[] = [];

        const allUserContents = await this.manager.find(UserContent, {
            where: {
                status: ContentStatus.APPROVED,
            },
            relations: {
                user: true,
                target_communities: {
                    categories: true,
                },
                target_topics: true,
            },
        });
        contentFeatures.push(
            ...(await Promise.all(
                allUserContents.map((content) => {
                    const tags: string[] = [];
                    const community = content.target_communities[0];

                    return {
                        item_id: content.id,
                        tags: community.category,
                        popularity:
                            content.like_count +
                            content.comment_count +
                            content.comment_count,
                        creator_id: content.user.id,
                    };
                }),
            )),
        );
        this.logger.log('获取内容特征数据完成');
        // 将数据存放在redis中
        this.logger.log('将数据存放在redis中');
        await this.redisClient.set(
            'userBehaviors',
            JSON.stringify(userBehaviors),
        );
        await this.redisClient.set(
            'contentFeatures',
            JSON.stringify(contentFeatures),
        );
        this.logger.log('将数据存放在redis中完成');
        return {
            userBehaviors,
            contentFeatures,
        };
    }
}
