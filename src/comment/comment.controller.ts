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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post('add-comment')
    async addComment(
        @Body() createCommentDto: CreateCommentDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result = await this.commentService.addComment(
            createCommentDto,
            userId,
        );
        res.status(result.StatuCode).send(result);
    }
    @Get('get-replies')
    @Public()
    async getCommentRepliesById(
        @Query('comment_id') comment_id: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result =
            await this.commentService.getCommentRepliesById(comment_id,userId);
        res.status(result.StatuCode).send(result);
    }
}
