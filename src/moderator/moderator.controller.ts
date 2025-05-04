import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    Res,
    Query,
} from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { Request, Response } from 'express';
import { ModPaginationCommunityContentDto } from './dto/mod-pagination-community-content.dto';

@Controller('moderator')
export class ModeratorController {
    constructor(private readonly moderatorService: ModeratorService) {}

    @Get('get-managed-communities')
    async getManagedCommunities(@Req() req: Request, @Res() res: Response) {
        const moderId = req['user'].id as string;
        const result =
            await this.moderatorService.getManagedCommunities(moderId);
        res.status(result.StatuCode).send(result);
    }

    // 分页获取社区内的帖子
    @Get('get-user-content-paginated/:communityId')
    async getCommunityContentPaginated(
        @Req() req: Request,
        @Res() res: Response,
        @Query() paginationUserContentDto: ModPaginationCommunityContentDto,
        @Param('communityId') communityId: bigint,
    ) {
        const moderId = req['user'].id as string;
        const result = await this.moderatorService.getCommunityContentPaginated(
            moderId,
            communityId,
            paginationUserContentDto,
        );
        res.status(result.StatuCode).send(result);
    }

    @Get('community/:communityId/contents')
    async getCommunityContents(
        @Req() req: Request,
        @Res() res: Response,
        @Param('communityId') communityId: bigint,
        @Query() paginationDto: ModPaginationCommunityContentDto,
    ) {
        const moderId = req['user'].id as string;
        const result = await this.moderatorService.getCommunityContentPaginated(
            moderId,
            communityId,
            paginationDto,
        );
        res.status(result.StatuCode).send(result);
    }
    @Post('content/:contentId/review')
    async reviewContent(
        @Req() req: Request,
        @Res() res: Response,
        @Param('contentId') contentId: bigint,
        @Body('action') action: 'approve' |'reject',
    ) {
        const moderId = req['user'].id as string;
        const result = await this.moderatorService.reviewContent(
            moderId,
            contentId,
            action,
        );
        res.status(result.StatuCode).send(result);
    }
}
