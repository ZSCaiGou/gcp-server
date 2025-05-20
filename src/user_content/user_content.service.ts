import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserContentDto } from './dto/create-user_content.dto';
import { UpdateUserContentDto } from './dto/update-user_content.dto';
import { OssUtilService } from 'src/utils/oss-util/oss-util.service';
import { randomUUID } from 'crypto';
import { MessageConstant } from 'src/common/constants';
import { Result } from 'src/common/result/Result';
import { DataSource, EntityManager, In } from 'typeorm';
import {
    ContentStatus,
    UserContent,
} from 'src/common/entity/user_content.entity';
import { Game } from 'src/common/entity/game.entity';
import { Topic } from 'src/common/entity/topic.entity';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';
import { User } from 'src/common/entity/user.entity';
import { Comment, CommentStatus } from 'src/common/entity/comment.entity';

@Injectable()
export class UserContentService {
    private readonly manager: EntityManager;
    constructor(
        private ossUtilService: OssUtilService,
        private dataSource: DataSource,
    ) {
        this.manager = this.dataSource.manager;
    }

    // 上传用户内容图片
    async uploadCover(file: Express.Multer.File) {
        const fileName = randomUUID() + '.' + file.mimetype.split('/')[1];
        const ossUrl = await this.ossUtilService.uploadUserContentCover(
            file,
            fileName,
        );
        return Result.success(MessageConstant.SUCCESS, ossUrl);
    }

    // 保存用户内容
    async savePostContent(
        user_id: string,
        createUserContentDto: CreateUserContentDto,
    ) {
        const userContent = this.manager.create(UserContent, {
            ...createUserContentDto,
            user_id,
        });
        // 用户内容只能选择一个社区或者话题
        if (userContent.game_ids.length > 1) {
            return Result.error(
                MessageConstant.USER_CONTENT_ALLOW_HAVE_ONE_COMMUNITY,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        const communitys = await this.manager.find(Game, {
            where: { id: In(userContent.game_ids) },
        });
        userContent.target_communities = communitys;
        const toipcs = await this.manager.find(Topic, {
            where: { id: In(userContent.topic_ids) },
        });
        userContent.target_topics = toipcs;
        // 保持内容
        const savedUserContent = await this.manager.save(userContent);

        // 增加热度
        if (userContent.game_ids.length > 0) {
            userContent.game_ids.forEach(async (id) => {
                await this.manager.increment(Game, id, 'hot_point', 1);
            });
        }
        // 增加热度和参与人数
        if (userContent.topic_ids.length > 0) {
            userContent.topic_ids.forEach(async (id) => {
                await this.manager.increment(Topic, id, 'hot_point', 1);
                // 用户是否已经参与过
                const count = await this.manager.count(Interaction, {
                    where: {
                        target_type: TargetType.TOPIC,
                        target_id: id as unknown as bigint,
                        user: {
                            id: savedUserContent.user_id,
                        },
                        type: 'join',
                    },
                    relations: {
                        user: true,
                    },
                });
                // 该用户第一次参与
                if (count === 0) {
                    const interAction = this.manager.create(Interaction, {
                        user_id: savedUserContent.user_id,
                        target_type: TargetType.TOPIC,
                        target_id: id as unknown as bigint,
                        type: 'join',
                    });
                    await this.manager.save(interAction);
                    await this.manager.increment(Topic, id, 'join_count', 1);
                }
            });
        }

        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 上传用户内容图片
    async uploadPicture(file: Express.Multer.File) {
        const fileName = randomUUID() + '.' + file.mimetype.split('/')[1];
        const ossUrl = await this.ossUtilService.uploadUserContentPicture(
            file,
            fileName,
        );
        return Result.success(MessageConstant.SUCCESS, { url: ossUrl });
    }
    // 获取主页内容
    async getMainUserContent(count: number) {
        // #TODO 实现推荐算法

        const userContentList = await this.manager.find(UserContent, {
            where: {
                status: ContentStatus.APPROVED,
            },
            order: {
                create_time: 'DESC',
            },
            take: count,
        });
        // 获取返回数据
        const data = await Promise.all(
            userContentList.map(async (content) => {
                const createUser = await this.manager.findOne(User, {
                    where: {
                        id: content.user_id,
                    },
                });
                // 获取游戏标签
                const gameTags: Game[] = await this.manager.findBy(Game, {
                    id: In(content.game_ids),
                });

                // 获取话题标签
                const topicTags: Topic[] = await this.manager.findBy(Topic, {
                    id: In(content.topic_ids),
                });

                return {
                    id: content.id,
                    title: content.title,
                    cover_url: content.cover_url,
                    create_time: content.create_time,
                    content: content.content,
                    type: content.type,
                    user_info: {
                        id: createUser?.id,
                        nickname: createUser?.profile.nickname
                            ? createUser?.profile.nickname
                            : createUser?.username,
                        avatar_url: createUser?.profile.avatar_url,
                        level: createUser?.level.level,
                    },
                    game_tags: gameTags.map((game) => ({
                        id: game.id,
                        title: game.title,
                        game_img_url: game.game_img_url,
                    })),
                    topic_tags: topicTags.map((topic) => ({
                        id: topic.id,
                        title: topic.title,
                    })),
                };
            }),
        );

        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 根据id获取用户内容
    async getUserContentById(
        id: string,
        userId: string | null,
        sortType: 'newest' | 'hottest' | 'oldest',
    ) {
        const interActionStatus: {
            isLike: boolean;
            isCollect: boolean;
            likedComments: bigint[];
            isFocused: boolean;
        } = {
            isLike: false,
            isCollect: false,
            likedComments: [],
            isFocused: false,
        };
        // 获取用户内容
        const userContent = await this.manager.findOne(UserContent, {
            where: {
                id: id as unknown as bigint,
            },
        });
        if (!userContent) {
            return Result.error(
                MessageConstant.USER_CONTENT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 获取创建者信息
        const createUser = await this.manager.findOne(User, {
            where: {
                id: userContent.user_id,
            },
        });
        // 如果用户id不为空，则是登录用户
        if (userId) {
            // 获取用户点赞和收藏状态
            const like = await this.manager.findOne(Interaction, {
                where: {
                    target_type: TargetType.CONTENT,
                    target_id: id as unknown as bigint,
                    type: InteractionType.LIKE,
                    user: {
                        id: userId,
                    },
                },
                relations: {
                    user: true,
                },
            });
            // 获取用户收藏状态
            const collect = await this.manager.findOne(Interaction, {
                where: {
                    target_type: TargetType.CONTENT,
                    target_id: id as unknown as bigint,
                    type: InteractionType.COLLECT,
                    user: { id: userId },
                },
                relations: {
                    user: true,
                },
            });
            if (like) {
                interActionStatus.isLike = true;
            }
            if (collect) {
                interActionStatus.isCollect = true;
            }

            // 获取用户点赞过的评论
            const likedComments = await this.manager.find(Interaction, {
                where: {
                    target_type: TargetType.COMMENT,
                    type: InteractionType.LIKE,
                    user: { id: userId },
                },
                relations: {
                    user: true,
                },
            });
            interActionStatus.likedComments.push(
                ...likedComments.map((comment) => comment.target_id),
            );
            // 获取用户是否关注了作者
            const focus = await this.manager.count(Interaction, {
                where: {
                    target_type: TargetType.USER,
                    type: InteractionType.FOLLOW,
                    user: {
                        id: userId,
                    },
                    target_user_id: createUser?.id,
                },
            });
            interActionStatus.isFocused = focus > 0;
        }

        // 获取游戏标签
        const gameTags: Game[] = await this.manager.findBy(Game, {
            id: In(userContent.game_ids),
        });
        // 获取话题标签
        const topicTags: Topic[] = await this.manager.findBy(Topic, {
            id: In(userContent.topic_ids),
        });
        const order = {};
        if (sortType === 'newest') {
            order['created_at'] = 'DESC';
        } else if (sortType === 'oldest') {
            order['created_at'] = 'ASC';
        } else if (sortType === 'hottest') {
            order['reply_count'] = 'DESC';
            order['like_count'] = 'DESC';
        }
        // 默认获取最新的500条获取评论
        const comments = await this.manager.find(Comment, {
            where: {
                parent_id: -1 as unknown as bigint,
                status: CommentStatus.NORMAL,
                target_content_id: userContent.id,
            },
            order,
            take: 500,
        });

        // 增加热度
        await this.manager.increment(
            Game,
            { id: In(userContent.game_ids) },
            'hot_point',
            1,
        );
        //增加热度
        await this.manager.increment(
            Topic,
            { id: In(userContent.topic_ids) },
            'hot_point',
            1,
        );

        const data = {
            id: userContent.id,
            title: userContent.title,
            cover_url: userContent.cover_url,
            create_time: userContent.create_time,
            picture_urls: userContent.picture_urls,
            content: userContent.content,
            type: userContent.type,
            like_count: userContent.like_count,
            isLiked: interActionStatus.isLike,
            isFavorited: interActionStatus.isCollect,
            collect_count: userContent.collect_count,
            comment_count: userContent.comment_count,
            user_info: {
                id: createUser?.id,
                nickname: createUser?.profile.nickname
                    ? createUser?.profile.nickname
                    : createUser?.username,
                avatar_url: createUser?.profile.avatar_url,
                level: createUser?.level.level,
                is_focused: interActionStatus.isFocused,
            },
            game_tags: gameTags.map((game) => ({
                id: game.id,
                title: game.title,
                game_img_url: game.game_img_url,
            })),
            topic_tags: topicTags.map((topic) => ({
                id: topic.id,
                title: topic.title,
            })),
            comments: comments.map((comment) => {
                return {
                    id: comment.id,
                    content: comment.content,
                    likeCount: comment.like_count,
                    reply_count: comment.reply_count,
                    create_at: comment.created_at,
                    isLiked: interActionStatus.likedComments.includes(
                        comment.id,
                    ),
                    user_info: comment.user_info,
                    parent_id: comment.parent_id,
                    origin_id: comment.origin_id,
                };
            }),
        };
        return Result.success(MessageConstant.SUCCESS, data);
    }
    // 删除用户内容
    async deleteUserContent(contentId: bigint, userId: string) {
        const content = await this.manager.findOneBy(UserContent, {
            id: contentId,
        });
        if (!content) {
            return Result.error(
                MessageConstant.USER_CONTENT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        if (content.user_id === userId) {
            content.status = ContentStatus.DELETED;
            await this.manager.save(content);
            return Result.success(MessageConstant.SUCCESS, null);
        } else {
            return Result.error(
                MessageConstant.USER_CONTENT_NOT_OWNER,
                HttpStatus.FORBIDDEN,
                null,
            );
        }
    }
}
