import { UserContentService } from './../user_content/user_content.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import {
    ArrayContains,
    ArrayOverlap,
    DataSource,
    EntityManager,
    Like,
} from 'typeorm';
import { Game } from 'src/common/entity/game.entity';
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

@Injectable()
export class GameService {
    private readonly manager: EntityManager;
    constructor(
        private readonly dataSource: DataSource,
        private readonly userContentService: UserContentService,
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
                    null    
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
                    null
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
                    null
                );
                return result.Data;
            }),
        );

        return Result.success(MessageConstant.SUCCESS, contentList);
    }
}
