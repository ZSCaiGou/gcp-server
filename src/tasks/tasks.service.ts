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
import { Game } from 'src/common/entity/game.entity';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';
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
        });
        if (userContentList.length === 0) {
            this.logger.log('没有待检测内容');
            return;
        }
        userContentList.forEach(async (userContent) => {
            if (userContent) {
                const content = userContent.content;
                const result = await this.openAIService.contetnReview(content);

                if (result.level === 'none') {
                    userContent.status = ContentStatus.APPROVED;
                    userContent.check_result = result.reason;
                    // #TODO 增加积分奖励
                } else {
                    userContent.check_result = result.reason;
                    userContent.status = ContentStatus.REJECTED;
                }
                await this.manager.save(userContent);
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
    async handleGetRecommendBaseData() {
        this.logger.log('开始获取推荐系统的基础数据');
        const AllUser = await this.manager.find(User, {
            where: {
                status: UserStatus.ACTIVE,
            },
        });
        const UserIds = AllUser.map((user) => user.id);
        
        const AllUserBehaviorList = await Promise.all(
            UserIds.map(async (userId) => {
                
                // 获取用户的行为数据
                // 1. 点赞
                const likeBh = await this.manager.find(Interaction, {
                    where: {
                        user: { id: userId },
                        type: InteractionType.LIKE,
                        target_type: TargetType.CONTENT,
                    },
                    relations: {
                        user: true,
                    },
                });
                // 2. 收藏
                const collectBh = await this.manager.find(Interaction, {
                    where: {
                        user: { id: userId },
                        type: InteractionType.COLLECT,
                        target_type: TargetType.CONTENT,
                    },
                    relations: {
                        user: true,
                    },
                });
                //3. 分享
                const shareBh = await this.manager.find(Interaction, {
                    where: {
                        user: { id: userId },
                        type: InteractionType.SHARE,
                        target_type: TargetType.CONTENT,
                    },
                    relations: {
                        user: true,
                    },
                });
                //4. 浏览
                const viewBh = await this.manager.find(UserViewHistory,{
                    where:{
                        user:{
                            id:userId
                        }
                    },
                    relations:{
                        user:true,
                    }
                })
                //5. 评论
                const commentBh = await this.manager.find(Comment)

            }),
        );
    }


    
}
