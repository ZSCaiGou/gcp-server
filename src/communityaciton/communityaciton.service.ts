import { MessageService } from './../message/message.service';
import { DataSource, EntityManager } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommunityacitonDto } from './dto/create-communityaciton.dto';
import { UpdateCommunityacitonDto } from './dto/update-communityaciton.dto';
import { AddLikeDto } from './dto/add-like.dto';
import { MessageConstant } from 'src/common/constants';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';
import { Result } from 'src/common/result/Result';
import { AddCollectDto } from './dto/add-collect.dto';
import { User } from 'src/common/entity/user.entity';
import { UserContent } from 'src/common/entity/user_content.entity';
import { Comment } from 'src/common/entity/comment.entity';
import {
    Notification,
    NotificationType,
} from 'src/common/entity/notification.entity';

@Injectable()
export class CommunityacitonService {
    private readonly manager: EntityManager;

    constructor(
        private readonly dataSource: DataSource,
        private readonly messageService: MessageService,
    ) {
        this.manager = this.dataSource.manager;
    }
    // 获取用户点赞
    async getUserLikes(user_id: string) {
        const likes = await this.manager.find(Interaction, {
            where: {
                user: {
                    id: user_id,
                },
                type: InteractionType.LIKE,
            },
            relations: {
                user: true,
            },
        });
        return Result.success(MessageConstant.SUCCESS, likes);
    }

    // 新增点赞和取消点赞
    async addLike(user_id: string, addLikeDto: AddLikeDto) {
        const user = await this.manager.findOneBy(User, {
            id: user_id,
        });
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        const result: { origin_id?: bigint } = {};
        // 判断是否已经点赞
        const existInteraction = await this.manager.findOne(Interaction, {
            where: {
                user: {
                    id: user_id,
                },
                target_type: addLikeDto.target_type,
                target_id: addLikeDto.target_id as unknown as bigint,
                type: InteractionType.LIKE,
            },
            relations: {
                user: true,
            },
        });
        // 取消点赞
        if (existInteraction) {
            await this.manager.delete(Interaction, existInteraction.id);
            if (addLikeDto.target_type === TargetType.CONTENT) {
                // 用户内容点赞
                await this.manager.increment(
                    UserContent,
                    {
                        id: addLikeDto.target_id as unknown as bigint,
                    },
                    'like_count',
                    -1,
                );
            } else {
                // 评论点赞
                await this.manager.increment(
                    Comment,
                    {
                        id: addLikeDto.target_id as unknown as bigint,
                    },
                    'like_count',
                    -1,
                );

                // origin_id用来判断是否是评论回复
                const { origin_id } = (await this.manager.findOne(Comment, {
                    where: {
                        id: addLikeDto.target_id as unknown as bigint,
                    },
                })) as Comment;
                result.origin_id = origin_id;
            }
            return Result.success(MessageConstant.SUCCESS, result);
        }
        // 新增点赞
        const interaction = this.manager.create(Interaction, {
            user_id,
            target_type: addLikeDto.target_type,
            target_id: addLikeDto.target_id as unknown as bigint,
            type: InteractionType.LIKE,
        });
        interaction.user = user;
        await this.manager.save(interaction);
        if (addLikeDto.target_type === TargetType.CONTENT) {
            await this.manager.increment(
                UserContent,
                {
                    id: addLikeDto.target_id as unknown as bigint,
                },
                'like_count',
                1,
            );
            const content = await this.manager.find(UserContent, {
                where: {
                    id: addLikeDto.target_id as unknown as bigint,
                },
                relations: ['user'],
            });
            await this.addNotifaication(
                content[0].user,
                `${user.profile.nickname || user.username}点赞了你的内容:《${content[0].title}》`,
            );
        } else {
            await this.manager.increment(
                Comment,
                {
                    id: addLikeDto.target_id as unknown as bigint,
                },
                'like_count',
                1,
            );
            const comment = await this.manager.find(Comment, {
                where: {
                    id: addLikeDto.target_id as unknown as bigint,
                },
                relations: ['user', 'target_content'],
            });
            await this.addNotifaication(
                comment[0].user,
                `${user.profile.nickname || user.username}点赞了你的评论:${comment[0].content}`,
            );
            const { origin_id } = (await this.manager.findOne(Comment, {
                where: {
                    id: addLikeDto.target_id as unknown as bigint,
                },
            })) as Comment;
            result.origin_id = origin_id;
        }
        return Result.success(MessageConstant.SUCCESS, result);
    }

    // 获取用户收藏
    async getUserCollects(user_id: string) {
        const collects = await this.manager.find(Interaction, {
            where: {
                user: {
                    id: user_id,
                },
                type: InteractionType.COLLECT,
            },
            relations: {
                user: true,
            },
        });
        return Result.success(MessageConstant.SUCCESS, collects);
    }
    //新增收藏
    async addCollect(user_id: string, addCollectDto: AddCollectDto) {
        const user = await this.manager.findOneBy(User, {
            id: user_id,
        });
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        if (addCollectDto.target_type !== TargetType.CONTENT) {
            return Result.error(
                MessageConstant.ILLEGAL_VALUE,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 判断是否已经收藏
        const existInteraction = await this.manager.findOne(Interaction, {
            where: {
                user: {
                    id: user_id,
                },
                target_type: addCollectDto.target_type,
                target_id: addCollectDto.target_id as unknown as bigint,
                type: InteractionType.COLLECT,
            },
            relations: {
                user: true,
            },
        });
        if (existInteraction) {
            await this.manager.delete(Interaction, existInteraction.id);
            await this.manager.increment(
                UserContent,
                {
                    id: addCollectDto.target_id as unknown as bigint,
                },
                'collect_count',
                -1,
            );
            return Result.success(MessageConstant.SUCCESS, null);
        }
        // 新增收藏
        const interaction = this.manager.create(Interaction, {
            user_id,
            target_type: addCollectDto.target_type,
            target_id: addCollectDto.target_id as unknown as bigint,
            type: InteractionType.COLLECT,
        });
        interaction.user = user;
        await this.manager.save(interaction);
        await this.manager.increment(
            UserContent,
            {
                id: addCollectDto.target_id as unknown as bigint,
            },
            'collect_count',
            1,
        );
        const content = await this.manager.find(UserContent, {
            where: {
                id: addCollectDto.target_id as unknown as bigint,
            },
            relations: ['user'],
        });
        await this.addNotifaication(
            content[0].user,
            `${user.profile.nickname || user.username}收藏了你的内容:《${content[0].title}》`,
        );

        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 关注和取消关注用户
    async toggleFocusUser(user_id: string, target_id: string) {
        const user = await this.manager.findOne(User, {
            where: {
                id: user_id,
            },
        });
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 判断是否已经关注
        const existInteraction = await this.manager.findOne(Interaction, {
            where: {
                user: {
                    id: user_id,
                },
                target_type: TargetType.USER,
                target_user_id: target_id,
                type: InteractionType.FOLLOW,
            },
            relations: {
                user: true,
            },
        });
        if (existInteraction) {
            await this.manager.delete(Interaction, existInteraction.id);

            await this.addNotifaication(
                (await this.manager.findOneBy(User, {
                    id: target_id,
                })) as User,
                `${user.profile.nickname || user.username}取消关注了你`,
            );
            return Result.success(MessageConstant.SUCCESS, null);
        }
        // 新增关注
        const interaction = this.manager.create(Interaction, {
            target_type: TargetType.USER,
            target_user_id: target_id,
            type: InteractionType.FOLLOW,
        });
        interaction.user = user;
        await this.manager.save(interaction);
        await this.addNotifaication(
            (await this.manager.findOneBy(User, {
                id: target_id,
            })) as User,
            `${user.profile.nickname || user.username}关注了你`,
        );

        return Result.success(MessageConstant.SUCCESS, null);
    }

    // 收藏内容
    async addContentCollect(user_id: string, content_id: string) {
        const targetContent = await this.manager.findOne(UserContent, {
            where: {
                id: content_id as unknown as bigint,
            },
            relations: ['user'],
        });
        if (!targetContent) {
            return Result.error(
                MessageConstant.USER_CONTENT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 判断是否已经收藏
        const existInteraction = await this.manager.findOne(Interaction, {
            where: {
                user: {
                    id: user_id,
                },
                target_type: TargetType.CONTENT,
                target_id: content_id as unknown as bigint,
                type: InteractionType.COLLECT,
            },
            relations: {
                user: true,
            },
        });
        if (existInteraction) {
            await this.manager.delete(Interaction, existInteraction.id);
            await this.addNotifaication(
                targetContent.user,
                `${existInteraction.user.profile.nickname || existInteraction.user.username}取消收藏了你的内容:${targetContent.title}`,
            );
            return Result.success(MessageConstant.SUCCESS, null);
        }
        // 新增收藏
        const interaction = this.manager.create(Interaction, {
            user_id,
            target_type: TargetType.CONTENT,
            target_id: content_id as unknown as bigint,
            type: InteractionType.COLLECT,
        });
        await this.manager.save(interaction);

        await this.addNotifaication(
            targetContent.user,
            `${interaction.user.profile.nickname || interaction.user.username}收藏了你的内容:${targetContent.title}`,
        );
        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 分享用户内容
    // async shareUserContent() {}

    async addNotifaication(TargetUser: User, message: string) {
        // 新增通知
        await this.messageService.createMessage(
            NotificationType.EVENT,
            message,
            TargetUser,
        );
    }
}
