import { PaginationFollowUserDto } from './dto/pagination-follow-user.dto';
import { OssUtilService } from './../utils/oss-util/oss-util.service';
import { PaginationCommunityDto } from './dto/pagination-community.dto';
import { UserContentService } from './../user_content/user_content.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import {
    ArrayContains,
    ArrayOverlap,
    DataSource,
    EntityManager,
    In,
    Like,
} from 'typeorm';
import { Game, GameStatus } from 'src/common/entity/game.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { Category } from 'src/common/entity/category.entity';
import { CategoryGameList } from 'src/common/interface';
import {
    ContentStatus,
    UserContent,
    UserContentType,
} from 'src/common/entity/user_content.entity';
import { title } from 'process';
import { GetGamePageDto } from './dto/get-game-page.dto';
import { User, UserStatus } from 'src/common/entity/user.entity';
import { randomUUID } from 'crypto';
import { AdminCreateCommunityDto } from './dto/admin-create-community.dto';
import { AdminUpdateCommunityDto } from './dto/admin-update-community.dto';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';

@Injectable()
export class GameService {
    private readonly manager: EntityManager;
    constructor(
        private readonly dataSource: DataSource,
        private readonly userContentService: UserContentService,
        private readonly ossUtilService: OssUtilService,
    ) {
        this.manager = this.dataSource.manager;
    }

    // 获取游戏分类列表
    async getGameCategoryList() {
        const categories = await this.manager.find(Category, {
            order: {
                id: 'ASC',
            },
        });
        const data = categories.map((category) => {
            return {
                id: category.id,
                name: category.name,
                isMain: category.isMain,
                label: category.name,
                value: category.name,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 获取游戏标签
    async getGameTags() {
        // 获取根据热度排序的前15个游戏
        const games = await this.manager.find(Game, {
            order: {
                hot_point: 'DESC',
            },
            take: 15,
        });

        // 格式化数据
        const data = games.map((game) => {
            return {
                id: game.id,
                title: game.title,
                game_img_url: game.game_img_url,
                hot_point: game.hot_point,
            };
        });

        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 根据游戏名称获取游戏标签
    async getGameTagsByName(keyWord: string) {
        const games = await this.manager.find(Game, {
            where: {
                title: Like(`%${keyWord}%`),
            },
            order: {
                hot_point: 'DESC',
            },
            take: 15,
        });
        const data = games.map((game) => {
            return {
                id: game.id,
                title: game.title,
                game_img_url: game.game_img_url,
                hot_point: game.hot_point,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 通过id获取游戏详情
    async getGameById(id: string) {
        const game = await this.manager.findOneBy(Game, {
            id: id as unknown as bigint,
            status: GameStatus.ACTIVE,
        });
        if (!game) {
            return Result.error(
                MessageConstant.USER_CONTENT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 格式化数据
        const data = {
            id: game.id,
            title: game.title,
            description: game.description,
            game_img_url: game.game_img_url,
            hot_point: game.hot_point,
        };
        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 获取热门游戏社区列表
    async getHotGameCommunityList() {
        // 获取游戏社区列表
        const gameList = await this.manager.find(Game, {
            where: {
                status: GameStatus.ACTIVE,
            },
            order: {
                hot_point: 'DESC',
            },
            take: 10,
        });
        // 格式化数据
        const data = gameList.map((game) => {
            return {
                id: game.id,
                title: game.title,
                game_img_url: game.game_img_url,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }
    // 根据游戏分类获取游戏社区列表
    async getGameCommunityListByCategory(category: string) {
        // 获取游戏社区列表
        const gameList = await this.manager
            .createQueryBuilder(Game, 'game')
            .where('JSON_CONTAINS(game.category, :category)', {
                category: JSON.stringify(category),
            })
            .andWhere('game.status = :status', {
                status: GameStatus.ACTIVE,
            })
            .orderBy('game.hot_point', 'DESC')
            .take(10)
            .getMany();

        // 格式化数据
        const data = gameList.map((game) => {
            return {
                id: game.id,
                title: game.title,
                game_img_url: game.game_img_url,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 根据游戏标签列表获取游戏社区列表
    async getGameCommunityListByCategoryList(categoryList: string[]) {
        const resultData = await Promise.all(
            categoryList.map(async (category) => {
                // 获取游戏社区列表
                const gameList = await this.manager
                    .createQueryBuilder(Game, 'game')
                    .where('JSON_CONTAINS(game.category,  :category)', {
                        category: JSON.stringify(category),
                    })
                    .andWhere('game.status = :status', {
                        status: GameStatus.ACTIVE,
                    })
                    .orderBy('game.hot_point', 'DESC')
                    .take(10)
                    .getMany();
                // 格式化数据
                return {
                    [category]: gameList.map((game) => ({
                        id: game.id,
                        title: game.title,
                        game_img_url: game.game_img_url,
                    })),
                };
            }),
        );

        return Result.success(MessageConstant.SUCCESS, resultData);
    }
    // 获取所有游戏分类列表
    async getAllCategoryGameList() {
        // 获取所有游戏分类列表
        const categories = await this.manager.find(Category, {
            order: {
                id: 'ASC',
            },
        });
        const resultData = await Promise.all(
            categories.map(async (category) => {
                // 获取游戏社区列表
                const gameList = await this.manager
                    .createQueryBuilder(Game, 'game')
                    .where('JSON_CONTAINS(game.category,  :category)', {
                        category: JSON.stringify(category.name),
                    })
                    .andWhere('game.status = :status', {
                        status: GameStatus.ACTIVE,
                    })
                    .orderBy('game.title', 'DESC')
                    .take(20)
                    .getMany();
                return {
                    [category.name]: {
                        gameList: gameList.map((game) => ({
                            id: game.id,
                            title: game.title,
                            game_img_url: game.game_img_url,
                        })),
                        pageInfo: {
                            total: gameList.length,
                            page: 1,
                            size: 20,
                        },
                    },
                };
            }),
        );
        return Result.success(MessageConstant.SUCCESS, resultData);
    }
    // 分页获取更多游戏列表
    async getCategoryGamesByPage(pageDto: GetGamePageDto) {
        const { page, size, category } = pageDto;
        const skip = (page - 1) * size;
        const take = size;
        // 获取游戏社区列表
        const gameList = await this.manager
            .createQueryBuilder(Game, 'game')
            .where('JSON_CONTAINS(game.category,  :category)', {
                category: JSON.stringify(category),
            })
            .andWhere('game.status = :status', {
                status: GameStatus.ACTIVE,
            })
            .orderBy('game.title', 'DESC')
            .skip(skip)
            .take(take)
            .getMany();
        // 格式化数据
        const data = gameList.map((game) => {
            return {
                id: game.id,
                title: game.title,
                game_img_url: game.game_img_url,
            };
        });
        return Result.success(MessageConstant.SUCCESS, {
            gameList: data,
            pageInfo: {
                total: gameList.length,
                page,
                size,
            },
        });
    }

    // 获取游戏社区帖子列表
    async getGameCommunityPostContentList(gameId: string) {
        const postList = await this.manager
            .createQueryBuilder(UserContent, 'UserContent')
            .where('JSON_CONTAINS(UserContent.game_ids, :gameId)', {
                gameId: JSON.stringify(gameId as string),
            })
            .andWhere('UserContent.status = :status', {
                status: ContentStatus.APPROVED,
            })
            .andWhere('UserContent.type = :type', {
                type: UserContentType.POST,
            })
            .orderBy('UserContent.create_time', 'DESC')
            .select(['UserContent.id'])
            .take(20)
            .getMany();

        const contentList = await Promise.all(
            postList.map(async (post) => {
                const result = await this.userContentService.getUserContentById(
                    post.id as unknown as string,
                    null,
                );
                return result.Data;
            }),
        );

        return Result.success(MessageConstant.SUCCESS, contentList);
    }

    // 获取游戏社区功略列表
    async getGameCommunityGuideList(gameId: string) {
        const guideList = await this.manager
            .createQueryBuilder(UserContent, 'UserContent')
            .where('JSON_CONTAINS(UserContent.game_ids, :gameId)', {
                gameId: JSON.stringify(gameId as string),
            })
            .andWhere('UserContent.status = :status', {
                status: ContentStatus.APPROVED,
            })
            .andWhere('UserContent.type = :type', {
                type: UserContentType.GUIDE,
            })
            .orderBy('UserContent.create_time', 'DESC')
            .select(['UserContent.id'])
            .take(20)
            .getMany();

        const contentList = await Promise.all(
            guideList.map(async (post) => {
                const result = await this.userContentService.getUserContentById(
                    post.id as unknown as string,
                    null,
                );
                return result.Data;
            }),
        );

        return Result.success(MessageConstant.SUCCESS, contentList);
    }

    // 获取游戏社区新闻资讯列表
    async getGameCommunityNewsList(gameId: string) {
        const newsList = await this.manager
            .createQueryBuilder(UserContent, 'UserContent')
            .where('JSON_CONTAINS(UserContent.game_ids, :gameId)', {
                gameId: JSON.stringify(gameId as string),
            })
            .andWhere('UserContent.status = :status', {
                status: ContentStatus.APPROVED,
            })
            .andWhere('UserContent.type = :type', {
                type: UserContentType.NEWS,
            })
            .orderBy('UserContent.create_time', 'DESC')
            .select(['UserContent.id'])
            .take(20)
            .getMany();

        const contentList = await Promise.all(
            newsList.map(async (post) => {
                const result = await this.userContentService.getUserContentById(
                    post.id as unknown as string,
                    null,
                );
                return result.Data;
            }),
        );

        return Result.success(MessageConstant.SUCCESS, contentList);
    }
    // 管理获取社区
    async getAdminCommunities() {
        const communities = await this.manager.find(Game, {
            order: {
                id: 'ASC',
            },
        });
        const data = communities.map((community) => {
            return {
                id: community.id,
                title: community.title,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }
    // 管理员分页获取社区
    async getAdminCommunitiesPaginated(
        paginationCommunityDto: PaginationCommunityDto,
        adminId: string,
    ) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }

        const {
            page,
            pageSize,
            status,
            search,
            sortField,
            sortOrder,
            categories,
        } = paginationCommunityDto;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const where = {};
        if (status) {
            where['status'] = In(status.split(','));
        }
        if (search) {
            where['title'] = Like(`%${search}%`);
        }
        if (categories) {
            where['category'] = ArrayContains(categories);
        }

        if (!status) {
            where['status'] = In([GameStatus.ACTIVE, GameStatus.DISABLED]);
        }
        const order = {};
        if (sortField) {
            order[sortField] = sortOrder === 'asc' ? 'ASC' : 'DESC';
        }
        const [communities, total] = await this.manager.findAndCount(Game, {
            where,
            order,
            skip,
            take,
        });

        const data = await Promise.all(
            communities.map(async (community) => {
                // 关注这个社区的用户数量
                const memberCount = await this.manager.count(Interaction, {
                    where: {
                        target_type: TargetType.GAME,
                        target_id: community.id,
                        type: InteractionType.FOLLOW,
                    },
                });
                // 版主数量
                const moderatorCount = await this.manager.count(User, {
                    where: {
                        managed_communities: {
                            id: In([community.id]),
                        },
                    },
                });
                return {
                    id: community.id,
                    title: community.title,
                    status: community.status,
                    category: community.category,
                    hot_point: community.hot_point,
                    tags: community.tags,
                    game_img_url: community.game_img_url,
                    member_count: memberCount,
                    moderator_count: moderatorCount,
                    created_at: community.created_at,
                    description: community.description,
                    last_updated_at: community.last_updated_at,
                };
            }),
        );
        const result = {
            items: data,
            total,
            page,
            pageSize,
        };
        return Result.success(MessageConstant.SUCCESS, result);
    }

    // 管理员上传社区图片
    async adminUploadCommunityImg(Img: Express.Multer.File, adminId: string) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }

        const imgName = randomUUID() + '.' + Img.mimetype.split('/')[1];
        const ossUrl = await this.ossUtilService.uploadCommunityImg(
            Img,
            imgName,
        );
        return Result.success(MessageConstant.SUCCESS, ossUrl);
    }
    // 管理员创建社区
    async adminCreateCommunity(
        createGameDto: AdminCreateCommunityDto,
        adminId: string,
    ) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }

        const community = new Game();
        community.title = createGameDto.title;
        community.description = createGameDto.description;
        community.game_img_url = createGameDto.game_img_url;
        community.category = createGameDto.category;
        const createdCommunity = await this.manager.save(community);
        return Result.success(MessageConstant.SUCCESS, createdCommunity);
    }
    // 管理员删除社区
    async adminDeleteCommunity(communityIds: bigint[], adminId: string) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }

        const communityList = await this.manager.find(Game, {
            where: {
                id: In(communityIds),
            },
        });
        if (communityList.length !== communityIds.length) {
            return Result.error(
                MessageConstant.COMMUNITY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        const communityToSave = communityList.map((c) => {
            c.status = GameStatus.DELETED;
            return c;
        });
        await this.manager.save(communityToSave);

        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 管理员修改社区状态
    async adminChangeCommunityStatus(
        communityIds: bigint[],
        status: GameStatus,
        adminId: string,
    ) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        // 获取社区
        const communityList = await this.manager.find(Game, {
            where: {
                id: In(communityIds),
            },
        });
        // 判断是否存在
        if (communityList.length !== communityIds.length) {
            return Result.error(
                MessageConstant.COMMUNITY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 修改状态
        const communityToSave = communityList.map((c) => {
            c.status = status;
            return c;
        });
        // 保存
        await this.manager.save(communityToSave);

        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 管理员修改社区信息
    async adminUpdateCommunity(
        communityId: bigint,
        updateGameDto: AdminUpdateCommunityDto,
        adminId: string,
    ) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }

        const community = await this.manager.findOneBy(Game, {
            id: communityId,
        });
        if (!community) {
            return Result.error(
                MessageConstant.COMMUNITY_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        community.title = updateGameDto.title;
        community.description = updateGameDto.description;
        community.game_img_url = updateGameDto.game_img_url;
        community.category = updateGameDto.category;
        const updatedCommunity = await this.manager.save(community);

        return Result.success(MessageConstant.SUCCESS, updatedCommunity);
    }

    // 管理员获取社区关注成员列表
    async adminGetCommunityFollowers(
        communityId: bigint,
        adminId: string,
        paginationFollowUserrDto: PaginationFollowUserDto,
    ) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        const { page, pageSize, sortField, sortOrder, search, status } =
            paginationFollowUserrDto;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const order = {};
        if (sortField) {
            if (sortField === 'join_time') {
                order['created_at'] = sortOrder === 'asc' ? 'ASC' : 'DESC';
            }
        }
        const [interactions, total] = await this.manager.findAndCount(
            Interaction,
            {
                where: {
                    target_id: communityId,
                    type: InteractionType.FOLLOW,
                    target_type: TargetType.GAME,
                },
                order,
                skip,
                take,
            },
        );
        const followUserIds = interactions.map((i) => i.user_id);

        if (sortField === 'username') {
            order['username'] = sortOrder === 'asc' ? 'ASC' : 'DESC';
        }
        // 获取关注用户
        const followUsers = await this.manager.find(User, {
            where: {
                id: In(followUserIds),
                status: In(status ? status.split(',') : [UserStatus.ACTIVE]),
                username: search ? Like(`%${search}%`) : undefined,
            },
        });
        const data = followUsers.map((user) => {
            const { id } = user;
            const joinTime = interactions.find(
                (i) => i.user_id === id,
            )?.created_at;
            return {
                id: user.id,
                username: user.username,
                status: user.status,
                email: user.email,
                join_time: joinTime,
            };
        });
        const result = {
            items: data,
            total,
            page,
            pageSize,
        };
        return Result.success(MessageConstant.SUCCESS, result);
    }
    // 管理员获取社区管理成员列表
    async adminGetModerators(communityId: bigint, adminId: string) {
        // 判断是否是管理员
        const admin = await this.manager.findOneBy(User, {
            id: adminId,
        });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        const moderators = await this.manager.find(User, {
            where: {
                managed_communities: {
                    id: In([communityId]),
                },
            },
        });

        return Result.success(
            MessageConstant.SUCCESS,
            moderators.map((m) => ({
                id: m.id,
                username: m.username,
                email: m.email,
                avatar_url: m.profile.avatar_url,
            })),
        );
    }
}
