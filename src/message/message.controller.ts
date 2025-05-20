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
    Put,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Request, Response } from 'express';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Get('all')
    async getAllMessages(@Req() req: Request, @Res() res: Response) {
        const userId = req['user']?.id as string;
        const result = await this.messageService.getAllMessages(userId);
        res.status(result.StatuCode).send(result);
    }

    @Get('unread')
    async getUnReadMessage(@Req() req: Request, @Res() res: Response) {
        const userId = req['user']?.id as string;
        const result = await this.messageService.getUnReadMessage(userId);

        res.status(result.StatuCode).send(result);
    }
    @Put('read/:messageId')
    async readMessage(
        @Req() req: Request,
        @Res() res: Response,
        @Param('messageId') messageId: bigint,
    ) {
        const userId = req['user']?.id as string;
        const result = await this.messageService.readMessage(userId, messageId);

        res.status(result.StatuCode).send(result);
    }
    @Get('unread-count')
    async getUnreadCount(@Req() req: Request, @Res() res: Response) {
        const userId = req['user']?.id as string;
        const result = await this.messageService.getUnreadCount(userId);

        res.status(result.StatuCode).send(result);
    }
}
