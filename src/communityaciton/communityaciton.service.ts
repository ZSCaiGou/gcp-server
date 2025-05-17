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

@Injectable()
export class CommunityacitonService {
    private readonly manager: EntityManager;

    constructor(private readonly dataSource: DataSource) {
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
        if (existInteraction) {
            await this.manager.delete(Interaction, existInteraction.id);
            if(addLikeDto.target_type === TargetType.CONTENT){
                await this.manager.increment(
                    UserContent,
                    {
                        id: addLikeDto.target_id as unknown as bigint,
                    },
                    'like_count',
                    -1,
                );
            }else{
                await this.manager.increment(
                    Comment,
                    {
                        id: addLikeDto.target_id as unknown as bigint,
                    },
                    'like_count',
                    -1,
                );
            }
            return Result.success(MessageConstant.SUCCESS, null);
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
        if(addLikeDto.target_type === TargetType.CONTENT){
            await this.manager.increment(
                UserContent,
                {
                    id: addLikeDto.target_id as unknown as bigint,
                },
                'like_count',
                1,
            );
        }else{
            await this.manager.increment(
                Comment,{
                    id: addLikeDto.target_id as unknown as bigint,
                },
                'like_count',
                1,
            );
        }
        return Result.success(MessageConstant.SUCCESS, null);
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
        return Result.success(MessageConstant.SUCCESS, null);
    }

    // 收藏内容
    async addContentCollect(user_id: string, content_id: string) {
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
        return Result.success(MessageConstant.SUCCESS, null);
    }
}
