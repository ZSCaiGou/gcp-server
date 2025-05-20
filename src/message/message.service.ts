import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { DataSource, EntityManager, In } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import {
    Notification,
    NotificationType,
} from 'src/common/entity/notification.entity';
import { User } from 'src/common/entity/user.entity';

@Injectable()
export class MessageService {
    private readonly manager: EntityManager;

    constructor(
        private readonly dataSource: DataSource,
        @InjectRedis() private readonly redisClient: Redis,
    ) {
        this.manager = this.dataSource.manager;
    }

    // 获取用户消息列表
    async getAllMessages(userId: string) {
        const message = await this.manager.find(Notification, {
            where: {
                user: {
                    id: userId,
                },
            },
            relations: ['user'],
            order: {
                created_at: 'DESC',
            },
        });
        return Result.success(MessageConstant.SUCCESS, message);
    }
    // 获取未读消息
    async getUnReadMessage(userId: string) {
        // 首先从redis中获取未读消息的id列表
        let unreadMessagesIds = await this.redisClient.smembers(
            `user:${userId}:message:unread`,
        );
        // 如果redis中没有未读消息的id列表，则从数据库中获取
        if (unreadMessagesIds.length === 0) {
            const mes = await this.manager.find(Notification, {
                where: {
                    is_read: false,
                    user: {
                        id: userId,
                    },
                },
                relations: ['user'],
                order: {
                    created_at: 'DESC',
                },
            });
            return Result.success(MessageConstant.SUCCESS, mes);
        } else {
            // 如果redis中有未读消息的id列表，则从数据库中获取
            const messages = await this.manager.find(Notification, {
                where: {
                    id: In(unreadMessagesIds),
                    user: {
                        id: userId,
                    },
                },
                relations: ['user'],
                order: {
                    created_at: 'DESC',
                },
            });
            return Result.success(MessageConstant.SUCCESS, messages);
        }
    }

    // 读消息
    async readMessage(userId: string, messageId: bigint) {
        // 从redis中删除该消息的id
        await this.redisClient.srem(
            `user:${userId}:message:unread`,
            messageId as unknown as string,
        );
        // 从数据库中更新该消息的is_read字段为true
        await this.manager.update(Notification, messageId, {
            is_read: true,
        });
        return Result.success(MessageConstant.SUCCESS, null);
    }

    // 创建消息
    async createMessage(type: NotificationType, content: string, user: User) {
        // 向数据库中插入消息
        const mess = this.manager.create(Notification, {
            type,
            content,
            user,
        });
        const savedMess = await this.manager.save(mess);

        // 向redis中插入该消息的id
        await this.redisClient.sadd(
            `user:${user.id}:message:unread`,
            savedMess.id as unknown as string,
        );
    }

    async getUnreadCount(userId: string) {
        const count = await this.redisClient.scard(
            `user:${userId}:message:unread`,
        );
        return Result.success(MessageConstant.SUCCESS, count);
    }
}
