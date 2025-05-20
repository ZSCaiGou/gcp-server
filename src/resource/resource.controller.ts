import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    Req,
    Res,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('resource')
export class ResourceController {
    constructor(private readonly resourceService: ResourceService) {}

    // 上传资源
    @Post('upload-resource')
    @UseInterceptors(FileInterceptor('file'))
    async uploadResource(
        @UploadedFile() file: Express.Multer.File,
        @Body() createResourceDto: CreateResourceDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result = await this.resourceService.uploadResource(
            file,
            createResourceDto,
            userId,
        );
        res.status(result.StatuCode).send(result);
    }

    // 获取资源列表
    @Get('get-resources/:gameId')
    @Public()
    async getResources(
        @Req() req: Request,
        @Res() res: Response,
        @Param('gameId') gameId: bigint,
    ) {
        const result = await this.resourceService.getResources(gameId);
        res.status(result.StatuCode).send(result);
    }
}
