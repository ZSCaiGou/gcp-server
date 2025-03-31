import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Logger,
    HttpCode,
    HttpStatus,
    Res,
    Query,
    Put,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { Public } from 'src/common/decorator/public.decorator';
import { ApiHeader } from '@nestjs/swagger';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
@ApiHeader({
    name: 'authorization',
})
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    @Public()
    async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
        const result = await this.authService.validateUser(loginUserDto);

        res.status(result.StatuCode).send(result);
    }

    // @Post('create')
    // @Public()
    // async create(@Body() createUserDto: CreateUserDto) {
    //     return await this.userService.create(createUserDto);
    // }

    @Get('all')
    @Public()
    findAll() {
        return 'This action returns all users';
    }

    @Get('getVerifyCode')
    @Public()
    async getVerifyCode(@Query('phone') phone: string, @Res() res: Response) {
        const result = await this.authService.getVerifyCode(phone);
        res.status(result.StatuCode).send(result);
    }

    @Get('userdata')
    async getUserData(@Req() req: Request, @Res() res: Response) {
        const userId = req['user'].id as string;
        const result = await this.userService.getUserData(userId);
        res.status(result.StatuCode).send(result);
    }

    @Put('userprofile')
    async updateUserProfile(
        @Req() req: Request,
        @Res() res: Response,
        @Body() updateUserProfileDto: UpdateUserProfileDto,
    ) {
        const userId = req['user'].id as string;
        const result = await this.userService.updateUserProfile(
            userId,
            updateUserProfileDto,
        );
        res.status(result.StatuCode).send(result);
    }

    @Post('useravatar')
    @UseInterceptors(FileInterceptor('avatar'))
    async updateUserAvatar(
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() avatar: Express.Multer.File,
    ) {
        const userId = req['user'].id as string;

        const result = await this.userService.updateUserAvatar(userId, avatar);
        res.status(result.StatuCode).send(result);
    }

    @Get('dynamic')
    async getUserDynamicContentList(@Req() req: Request, @Res() res: Response) {
        const userId = req['user'].id as string;
        const result = await this.userService.getUserDynamicContentList(userId);
        res.status(result.StatuCode).send(result);
    }
    
    @Get('upload')
    async getUserUploadContentList(@Req() req: Request, @Res() res: Response) {
        const userId = req['user'].id as string;
        const result = await this.userService.getUserUploadContentList(userId);
        res.status(result.StatuCode).send(result);
    }
}
