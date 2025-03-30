import { TextModerationResponse } from '@alicloud/green20220302';
import { Injectable, Logger } from '@nestjs/common';
import { Interval, Timeout } from '@nestjs/schedule';
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
                const result: TextModerationResponse =
                    await this.greenService.contentScan(content);
                console.log(result);
                
                if (result.body?.data?.labels === "") {
                    userContent.status = ContentStatus.APPROVED;
                } else {
                    userContent.check_result =
                        result.body?.data?.descriptions || '';
                    userContent.status = ContentStatus.REJECTED;
                    this.logger.log(`内容违规，id：${userContent.id} 结果：${userContent.check_result}`)
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
}
