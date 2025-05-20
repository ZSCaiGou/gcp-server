import { DataSource, EntityManager } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from 'src/common/entity/topic.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { User } from 'src/common/entity/user.entity';

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

    // 创建话题
    async createTopic(createTopicDto: CreateTopicDto, userId: string) {
        const user = await this.mannager.findOne(User, {
            where: {
                id: userId,
            },
        });
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 创建话题
        const topic = this.mannager.create(Topic, createTopicDto);
        // 话题是否以及存在
        const existTopic = await this.mannager.findOne(Topic, {
            where: {
                title: topic.title,
            },
        });
        if (existTopic) {
            return Result.error(
                MessageConstant.TOPIC_ALREADY_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        topic.user = user;
        // 保存话题
        const savedTopic = await this.mannager.save(topic);
        return Result.success(MessageConstant.SUCCESS, savedTopic);
    }

    // 更新话题
    async updateTopic(user_id: string, updateTopicDto: UpdateTopicDto) {
        // 话题是否存在
        const existTopic = await this.mannager.findOne(Topic, {
            where: {
                title: updateTopicDto.title,
            },
            relations: {
                user: true,
            },
        });
        if (!existTopic) {
            return Result.error(
                MessageConstant.TOPIC_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 判断是否是该话题的拥有者
        if (existTopic.user.id !== user_id) {
            return Result.error(
                MessageConstant.TOPIC_NOT_OWNER,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }

        // 判断更新后的话题是否已经存在
        const existTopicAfterUpdate = await this.mannager.findOne(Topic, {
            where: {
                title: updateTopicDto.title,
            },
        });
        if (existTopicAfterUpdate) {
            return Result.error(
                MessageConstant.TOPIC_ALREADY_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 更新话题
        const updatedTopic = await this.mannager.update(
            Topic,
            existTopic.id,
            updateTopicDto,
        );
        return Result.success(MessageConstant.SUCCESS, updatedTopic);
    }
    // 删除话题
    async deleteTopic(user_id: string, topic_id: string) {
        // 话题是否存在
        const existTopic = await this.mannager.findOne(Topic, {
            where: {
                title: topic_id,
            },
            relations: {
                user: true,
            },
        });
        if (!existTopic) {
            return Result.error(
                MessageConstant.TOPIC_NOT_FOUND,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 判断是否是该话题的拥有者
        if (existTopic.user.id !== user_id) {
            return Result.error(
                MessageConstant.TOPIC_NOT_OWNER,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }

        // 删除话题
        const deletedTopic = await this.mannager.delete(Topic, existTopic.id);
        return Result.success(MessageConstant.SUCCESS, deletedTopic);
    }
}
