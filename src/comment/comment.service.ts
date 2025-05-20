import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { EntityManager, DataSource, Not } from 'typeorm';
import { Comment } from 'src/common/entity/comment.entity';
import { User } from 'src/common/entity/user.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { UserContent } from 'src/common/entity/user_content.entity';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';

@Injectable()
export class CommentService {
    private readonly manager: EntityManager;
    constructor(private dataSource: DataSource) {
        this.manager = this.dataSource.manager;
    }
    // 创建评论
    async addComment(createCommentDto: CreateCommentDto, userId: string) {
        const { target_content_id, content, parent_id } = createCommentDto;
        const user = await this.manager.findOneBy(User, { id: userId });
        // 创建评论
        const comment = this.manager.create(Comment, {
            target_content_id,
            content,
            parent_id,
            user_info: {
                id: user?.id,
                nickname: user?.profile.nickname || user?.username,
                avatar_url: user?.profile.avatar_url,
                level: user?.level.level,
            },
        });
        if (comment.parent_id != (-1 as unknown as bigint)) {
            // 获取父评论
            const parentComment = await this.manager.findOneBy(Comment, {
                id: comment.parent_id,
            });
            if (parentComment) {
                // 更新父评论的回复数
                parentComment.reply_count += 1;
                await this.manager.save(parentComment);
                // 父评论的ID不等于原始评论ID，说明是二级评论，需要更新原始评论的回复数
                if (parentComment.id != parentComment.origin_id) {
                    await this.manager.increment(
                        Comment,
                        { id: parentComment.origin_id },
                        'reply_count',
                        1,
                    );
                }
                // 记录原始评论ID
                comment.origin_id = parentComment.origin_id;
            }
        }
        // 保存评论
        const savedComment = await this.manager.save(comment);
        if (savedComment.parent_id == (-1 as unknown as bigint)) {
            savedComment.origin_id = savedComment.id;
            await this.manager.save(savedComment);
        }
        // 更新用户的评论数
        await this.manager.increment(
            UserContent,
            { id: target_content_id },
            'comment_count',
            1,
        );

        return Result.success(MessageConstant.SUCCESS, savedComment);
    }

    async getCommentRepliesById(comment_id: string, userId: string) {
        const likedCommentIds: string[] = [];
        // 获取用户的所有点赞
        if (userId !== null) {
            const userLikedCommentIds = await this.manager.find(Interaction, {
                where: {
                    user: {
                        id: userId,
                    },
                    type: InteractionType.LIKE,
                    target_type: TargetType.COMMENT,
                },
                relations: ['user'],
                select: ['target_id'],
            });
            likedCommentIds.push(
                ...userLikedCommentIds.map(
                    (item) => item.target_id as unknown as string,
                ),
            );
        }
        const commentsReplies = await this.manager.find(Comment, {
            where: {
                origin_id: comment_id as unknown as bigint,
                id: Not(comment_id as unknown as bigint),
            },
            order: {
                created_at: 'ASC',
            },
            take: 10,
        });
        return Result.success(
            MessageConstant.SUCCESS,
            commentsReplies.map((comment) => {
                return {
                    id: comment.id,
                    content: comment.content,
                    user_info: comment.user_info,
                    created_at: comment.created_at,
                    likeCount: comment.like_count,
                    replyCount: comment.reply_count,
                    isLiked: likedCommentIds.includes(comment.id.toString()),
                };
            }),
        );
    }
}
