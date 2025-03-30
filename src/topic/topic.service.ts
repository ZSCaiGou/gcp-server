import { DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from 'src/common/entity/topic.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';

@Injectable()
export class TopicService {
    private readonly mannager: EntityManager;
    constructor(private readonly dataSouce: DataSource) {
        this.mannager = this.dataSouce.manager;
    }
    // 获取话题标签
    async getTopicTags() {
        // 获取根据热度排序的前15个话题
        const topics = await this.mannager.find(Topic, {
            order: {
                hot_point: 'DESC',
            },
            take: 15,
        });
        // 格式化数据
        const data = topics.map((topic) => {
            return {
                id: topic.id,
                title: topic.title,
                hot_point: topic.hot_point,
                join_count: topic.join_count,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }
}
