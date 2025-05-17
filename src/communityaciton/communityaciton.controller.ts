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
} from '@nestjs/common';
import { CommunityacitonService } from './communityaciton.service';
import { CreateCommunityacitonDto } from './dto/create-communityaciton.dto';
import { UpdateCommunityacitonDto } from './dto/update-communityaciton.dto';
import { AddLikeDto } from './dto/add-like.dto';
import { Request, Response } from 'express';
import { AddCollectDto } from './dto/add-collect.dto';

@Controller('communityaction')
export class CommunityacitonController {
    constructor(
        private readonly communityacitonService: CommunityacitonService,
    ) {}
    @Post('add-like')
    async addLike(
        @Body() addLikeDto: AddLikeDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const user_id = req['user'].id as string;
        const result = await this.communityacitonService.addLike(
            user_id,
            addLikeDto,
        );
        res.status(result.StatuCode).send(result);
    }
    @Post('add-collect')
    async addCollect(
        @Body() addCollectDto: AddCollectDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const user_id = req['user'].id as string;
        const result = await this.communityacitonService.addCollect(
            user_id,
            addCollectDto,
        );
        res.status(result.StatuCode).send(result);
    }
    @Post('toggle-focus-user')
    async toggleFocusUser(
        @Body('userId') target_id: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const user_id = req['user'].id as string;
        const result = await this.communityacitonService.toggleFocusUser(
            user_id,
            target_id,
        );
        res.status(result.StatuCode).send(result);
    }

}
