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
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { Request, Response } from 'express';
import { GetGamePageDto } from './dto/get-game-page.dto';
import { PaginationCommunityDto } from './dto/pagination-community.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminCreateCommunityDto } from './dto/admin-create-community.dto';
import { GameStatus } from 'src/common/entity/game.entity';
import { AdminUpdateCommunityDto } from './dto/admin-update-community.dto';
import { PaginationFollowUserDto } from './dto/pagination-follow-user.dto';

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

    // 获取所有游戏分类下的游戏列表
    @Get('category-game-list')
    @Public()
    async getAllCategoryGameList(@Req() req: Request, @Res() res: Response) {
        const result = await this.gameService.getAllCategoryGameList();
        res.status(result.StatuCode).send(result);
    }

    // 分页获取游戏分类下的更多游戏列表
    @Post('game-community-list-page')
    @Public()
    async getCategoryGamesByPage(
        @Req() req: Request,
        @Res() res: Response,
        @Body() pageDto: GetGamePageDto,
    ) {
        const resutl = await this.gameService.getCategoryGamesByPage(pageDto);
        res.status(resutl.StatuCode).send(resutl);
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
    // 管理员获取社区
    @Get('admin-communities')
    async getAdminCommunities(@Req() req: Request, @Res() res: Response) {
        const result = await this.gameService.getAdminCommunities();
        res.status(result.StatuCode).send(result);
    }
    // 管理员分页获取社区列表
    @Get('admin-communities-paginated')
    async getAdminCommunitiesPaginated(
        @Req() req: Request,
        @Res() res: Response,
        @Query() paginationCommunityDto: PaginationCommunityDto,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.getAdminCommunitiesPaginated(
            paginationCommunityDto,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }
    // 管理员上传社区图片
    @Post('admin-upload-community-img')
    @UseInterceptors(FileInterceptor('image'))
    async AdminUploadCommunityImg(
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() image: Express.Multer.File,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.adminUploadCommunityImg(
            image,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }
    // 管理员创建社区
    @Post('admin-create-community')
    async adminCreateCommunity(
        @Req() req: Request,
        @Res() res: Response,
        @Body() createGameDto: AdminCreateCommunityDto,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.adminCreateCommunity(
            createGameDto,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }
    // 管理员删除社区
    @Patch('admin-delete-community')
    async adminDeleteCommunity(
        @Req() req: Request,
        @Res() res: Response,
        @Body("community_ids") communityIds: bigint[],
    ) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.adminDeleteCommunity(
            communityIds,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }
    // 管理员修改社区状态
    @Patch('admin-change-community-status')
    async adminChangeCommunityStatus(
        @Req() req: Request,
        @Res() res: Response,
        @Body("community_ids") communityIds: bigint[],
        @Body("status") status: string,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.adminChangeCommunityStatus(
            communityIds,
            status as GameStatus,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }
    // 管理员更新社区
    @Patch('admin-update-community/:id')
    async adminUpdateCommunity(
        @Req() req: Request,
        @Res() res: Response,
        @Param('id') communityId: bigint,
        @Body() updateGameDto: AdminUpdateCommunityDto,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.adminUpdateCommunity(
            communityId,
            updateGameDto,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }
    // 管理员获取社区粉丝列表
    @Get('admin-get-community-followers/:communityId')
    async adminGetCommunityFollowers(
        @Param('communityId') communityId: bigint,
        @Query() paginationFollowUserDto: PaginationFollowUserDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.adminGetCommunityFollowers(
            communityId,
            adminId,
            paginationFollowUserDto,
        );
        res.status(result.StatuCode).send(result);
    
    }
    // 管理员获取社区管理员列表
    @Get('admin-get-moderators/:communityId')
    async adminGetModerators(@Param('communityId') communityId: bigint, @Req() req: Request, @Res() res: Response) {
        const adminId = req['user'].id as string;
        const result = await this.gameService.adminGetModerators(communityId, adminId);
        res.status(result.StatuCode).send(result);
    }
}
