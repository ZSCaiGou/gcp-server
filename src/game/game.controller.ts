import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Req,
    Res,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { Request, Response } from 'express';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    // 获取热门游戏标签列表
    @Get('tags')
    @Public()
    async getGameTags(@Req() req: Request, @Res() res: Response) {
        const result = await this.gameService.getGameTags();
        res.status(result.StatuCode).send(result);
    }

    // 根据游戏名称获取游戏标签
    @Get('tags-by-name')
    async getGameTagsByName(
        @Query('keyWord') keyWord: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result = await this.gameService.getGameTagsByName(keyWord);
        res.status(result.StatuCode).send(result);
    }

    // 通过id获取游戏详情
    @Get('get-game')
    @Public()
    async getGameById(
        @Query('id') id: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result = await this.gameService.getGameById(id);
        res.status(result.StatuCode).send(result);
    }

    // 获取热门游戏社区列表
    @Get('hot-game-community')
    @Public()
    async getHotGameCommunityList(@Req() req: Request, @Res() res: Response) {
        const result = await this.gameService.getHotGameCommunityList();
        res.status(result.StatuCode).send(result);
    }

    // 获取游戏分类列表
    @Get('game-category')
    @Public()
    async getGameCategoryList(@Req() req: Request, @Res() res: Response) {
        const result = await this.gameService.getGameCategoryList();
        res.status(result.StatuCode).send(result);
    }

    // 根据游戏分类获取游戏社区列表
    @Get('game-community-category')
    @Public()
    async getGameCommunityListByCategory(
        @Query('category') category: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result =
            await this.gameService.getGameCommunityListByCategory(category);
        res.status(result.StatuCode).send(result);
    }
    // 根据游戏分类列表获取游戏社区列表
    @Post('game-community-category-list')
    @Public()
    async postGameCommunityListByCategoryList(
        @Req() req: Request,
        @Res() res: Response,
        @Body() categoryList: string[],
    ) {
        const result =
            await this.gameService.getGameCommunityListByCategoryList(
                categoryList,
            );
        res.status(result.StatuCode).send(result);
    }

    // 获取游戏社区帖子列表
    @Get('game-community-post-content')
    @Public()
    async getGameCommunityPostContentList(
        @Query('gameId') gameId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result =
            await this.gameService.getGameCommunityPostContentList(gameId);
        res.status(result.StatuCode).send(result);
    }

    // 获取游戏社区攻略列表
    @Get('game-community-guide-content')
    @Public()
    async getGameCommunityGuideList(
        @Query('gameId') gameId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result = await this.gameService.getGameCommunityGuideList(gameId);
        res.status(result.StatuCode).send(result);
    }

    // 获取游戏社区新闻列表
    @Get('game-community-news-content')
    @Public()
    async getGameCommunityNewsList(
        @Query('gameId') gameId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const result = await this.gameService.getGameCommunityNewsList(gameId);
        res.status(result.StatuCode).send(result);
    }
}
