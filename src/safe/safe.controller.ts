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
import { SafeService } from './safe.service';
import { CreateSafeDto } from './dto/create-safe.dto';
import { UpdateSafeDto } from './dto/update-safe.dto';
import { SendVerifyCodeDto } from './dto/send-verifycode.dto';
import { Request, Response } from 'express';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';

@Controller('safe')
export class SafeController {
    constructor(private readonly safeService: SafeService) {}

    @Post('send-verify-code')
    async sendVerifyCode(
        @Body() sendVerifyCodeDto: SendVerifyCodeDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result = await this.safeService.sendVerifyCode(
            userId,
            sendVerifyCodeDto,
        );
        return res.status(result.StatuCode).json(result);
    }
    @Post('update-password')
    async updatePassword(
        @Body() updatePasswordDto: UpdatePasswordDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result = await this.safeService.updatePassword(
            userId,
            updatePasswordDto,
        );
        return res.status(result.StatuCode).json(result);
    }
    @Post('update-username')
    async updateUserName(
        @Body('newUsername') username: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result = await this.safeService.updateUserName(userId, username);
        return res.status(result.StatuCode).json(result);
    }
    @Post('update-email')
    async updateEmail(
        @Body() updateEmailDto: UpdateEmailDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result = await this.safeService.updateEmail(
            userId,
            updateEmailDto,
        );
        return res.status(result.StatuCode).json(result);
    }
    @Post('update-phone')
    async updatePhone(
        @Body() updatePhoneDto: UpdatePhoneDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const userId = req['user'].id as string;
        const result = await this.safeService.updatePhone(
            userId,
            updatePhoneDto,
        );
        return res.status(result.StatuCode).json(result);
    }
}
