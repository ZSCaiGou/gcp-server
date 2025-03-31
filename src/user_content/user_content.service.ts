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
import { Interaction, TargetType } from 'src/common/entity/interaction.entity';
import { User } from 'src/common/entity/user.entity';

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
                        user_id: savedUserContent.user_id,
                        type: 'join',
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
    async getMainUserContent() {
        // #TODO 实现推荐算法

        const userContentList = await this.manager.find(UserContent, {
            where: {
                status: ContentStatus.APPROVED,
            },
            order: {
                create_time: 'DESC',
            },
            take: 10,
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

        return Result.success(MessageConstant.SUCCESS,data);
    }

    // 根据id获取用户内容
    async getUserContentById(id: string) {
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
        const gameTags: Game[] = await this.manager.findBy(Game, {
            id: In(userContent.game_ids),
        });
        const topicTags: Topic[] = await this.manager.findBy(Topic, {
            id: In(userContent.topic_ids),
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
        return Result.success(MessageConstant.SUCCESS, data);
    }
}
