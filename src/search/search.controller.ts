import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
    Query,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { Response } from 'express';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    @Get('get-search')
    @Public()
    async getSearch(@Query('keyword') keyword: string, @Res() res: Response) {
        const result = await this.searchService.getSearch(keyword);
        return res.status(result.StatuCode).send(result);
    }
}
