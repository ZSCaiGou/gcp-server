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
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Request, Response } from 'express';

@Controller('topic')
export class TopicController {
    constructor(private readonly topicService: TopicService) {}

    @Get('tags')
    async getTopicTags() {
        const result = await this.topicService.getTopicTags();

        return result;
    }

    @Post('add-topic')
    async createTopic(
        @Body() createTopicDto: CreateTopicDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user']?.id as string;
        const result = await this.topicService.createTopic(
            createTopicDto,
            userId,
        );
        res.status(result.StatuCode).send(result);
    }
}
