import {
    TextModerationResponse,
    TextModerationPlusResponse,
} from '@alicloud/green20220302';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { TimeInterval } from 'rxjs/internal/operators/timeInterval';
import { Game } from 'src/common/entity/game.entity';
import {
    ContentStatus,
    UserContent,
} from 'src/common/entity/user_content.entity';
import { GreenService } from 'src/utils/green/green.service';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TasksService {
    private readonly manager: EntityManager;
    private readonly logger = new Logger(TasksService.name);
    constructor(
        private readonly greenService: GreenService,
        private readonly dataSouce: DataSource,
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
                const result: TextModerationPlusResponse =
                    await this.greenService.contentScan(content);
                console.log(result.body);
                
                if (result.body?.data?.riskLevel === 'none') {
                    userContent.status = ContentStatus.APPROVED;
                    // #TODO 增加积分奖励
                } else {
                    userContent.check_result =
                        result.body?.data?.result?.[0].description || '';
                    userContent.status = ContentStatus.REJECTED;
                    this.logger.log(
                        `内容违规，id：${userContent.id} 结果：${userContent.check_result}`,
                    );
                }
                await this.manager.save(userContent);
                this.logger.log(
                    `内容检测完成，id：${userContent.id} 状态：${userContent.status}`,
                );
            } else {
                this.logger.log('没有待检测内容');
            }
        });
    }
    // 每周一凌晨 00:00 减少社区热度为原来的80%
    @Cron(CronExpression.EVERY_WEEK)
    async handleWeeklyDecreaseeCommunityHotPoint(){
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
        communityList.map((community)=>{
            if(community.hot_point>0){
                community.hot_point = Math.floor(community.hot_point*0.8);
            }
        })
        await this.manager.save(communityList);
        this.logger.log('减少社区热度完成');
    }
}
