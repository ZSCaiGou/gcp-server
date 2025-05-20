import { OssUtilService } from './../utils/oss-util/oss-util.service';
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    Req,
    Res,
    UploadedFile,
    Query,
} from '@nestjs/common';
import { UserContentService } from './user_content.service';
import { CreateUserContentDto } from './dto/create-user_content.dto';
import { UpdateUserContentDto } from './dto/update-user_content.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('user-content')
export class UserContentController {
    constructor(private readonly userContentService: UserContentService) {}
    // 上传封面
    @Post('cover')
    @UseInterceptors(FileInterceptor('cover'))
    async uploadCover(
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() cover: Express.Multer.File,
    ) {
        const result = await this.userContentService.uploadCover(cover);
        res.status(result.StatuCode).send(result);
    }
    // 保存用户内容
    @Post('post-content')
    async savePostContent(
        @Body() createUserContentDto: CreateUserContentDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const user_id = req['user'].id as string;
        const result = await this.userContentService.savePostContent(
            user_id,
            createUserContentDto,
        );
        res.status(result.StatuCode).send(result);
    }
    @Post('picture')
    @UseInterceptors(FileInterceptor('picture'))
    async uploadPicture(
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() picture: Express.Multer.File,
    ) {
        const result = await this.userContentService.uploadPicture(picture);
        res.status(result.StatuCode).send(result);
    }
    // 获取主页用户内容
    @Get('random-content')
    @Public()
    async getMainUserContent(
        @Req() req: Request,
        @Res() res: Response,
        @Param('count') count: number,
    ) {
        const result = await this.userContentService.getMainUserContent(count);
        res.status(result.StatuCode).send(result);
    }

    // 根据id获取用户内容
    @Get('get-content')
    @Public()
    async getUserContentById(
        @Query('id') id: string,
        @Query('sortType') sortType: 'newest' | 'hottest' | 'oldest',
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user']?.id as string;
        const result = await this.userContentService.getUserContentById(
            id,
            userId,
            sortType,
        );
        res.status(result.StatuCode).send(result);
    }

    @Delete('delete-user-content/:id')
    async deleteUserContent(
        @Param('id') id: bigint,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user']?.id as string;
        const result = await this.userContentService.deleteUserContent(
            id,
            userId,
        );
        res.status(result.StatuCode).send(result);
    }
}
