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
import { PaginationUserDto } from './dto/pagination-user.dto';
import { AdminAddUserDto } from './dto/admin-add-user.dto';
import { UserStatus } from 'src/common/entity/user.entity';
import { AdminAddModeratorDto } from './dto/admin-add-moderator.dto';
import { AdminDeleteModeratorDto } from './dto/admin-delete-moderator.dto';

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

    @Get('getVerifyCode')
    @Public()
    async getVerifyCode(@Query('email') email: string, @Res() res: Response) {
        const result = await this.authService.getVerifyCode(email);
        res.status(result.StatuCode).send(result);
    }

    @Get('userdata')
    async getUserData(@Req() req: Request, @Res() res: Response) {
        const userId = req['user'].id as string;
        const result = await this.userService.getUserData(userId);
        res.status(result.StatuCode).send(result);
    }
    @Get('get-user-by-id/:id')
    @Public()
    async getUserById(@Param('id') id: string, @Res() res: Response, @Req() req: Request){
        const result = await this.userService.findOneById(id);
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

    @Get('dynamic/:id')
    async getUserDynamicContentList(@Req() req: Request, @Res() res: Response,@Param('id') id: string) {
        const userId = req['user'].id as string;
        const result = await this.userService.getUserDynamicContentList(id);
        res.status(result.StatuCode).send(result);
    }

    @Get('upload/:id')
    async getUserUploadContentList(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
        const userId = req['user'].id as string;
        const result = await this.userService.getUserUploadContentList(id);
        res.status(result.StatuCode).send(result);
    }
    @Get('admin-users-paginated')
    async getAdminUsersPaginated(
        @Req() req: Request,
        @Res() res: Response,
        @Query() paginationUserDto: PaginationUserDto,
    ) {
        const userId = req['user'].id as string;
        const result = await this.userService.getAdminUsersPaginated(
            paginationUserDto,
            userId,
        );
        res.status(result.StatuCode).send(result);
    }
    @Put('admin-user/:id')
    async putAdminUser(
        @Req() req: Request,
        @Res() res: Response,
        @Body() updateUserDto: UpdateUserDto,
        @Param('id') userId: string,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.userService.updateAdminUser(
            userId,
            updateUserDto,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }

    @Post('admin-add-user')
    async addAdminUser(
        @Req() req: Request,
        @Res() res: Response,
        @Body() addUserDto: AdminAddUserDto,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.userService.addAdminUser(addUserDto, adminId);
        res.status(result.StatuCode).send(result);
    }

    @Patch('admin-delete-user')
    async adminDeleteUser(
        @Req() req: Request,
        @Res() res: Response,
        @Body('userIds') userIds: string[],
    ) {
        const adminId = req['user'].id as string;
        const result = await this.userService.adminDeleteUser(userIds, adminId);
        res.status(result.StatuCode).send(result);
    }

    @Patch('admin-change-user-status')
    async adminChangeUserStatus(
        @Req() req: Request,
        @Res() res: Response,
        @Body('userIds') userIds: string[],
        @Body('status') status: UserStatus,
    ) {
        const adminId = req['user'].id as string;
        const result = await this.userService.adminChangeUserStatus(
            userIds,
            status,
            adminId,
        );
        res.status(result.StatuCode).send(result);
    }
    // 搜索用户
    @Get('admin-search-user')
    async adminSearchUser( @Req() req: Request, @Res() res: Response, @Query('search') search: string){
        const adminId = req['user'].id as string;
        const result = await this.userService.adminSearchUser(adminId,search);
        res.status(result.StatuCode).send(result);
    }
    // 管理员添加社区版主
    @Post('admin-add-moderator')
    async adminAddModerator(@Req() req: Request, @Res() res: Response, @Body() addModeratorDto: AdminAddModeratorDto) {
        const adminId = req['user'].id as string;
        const result = await this.userService.adminAddModerator( adminId,addModeratorDto);
        res.status(result.StatuCode).send(result);
    }

    @Patch("admin-delete-moderator")
    async adminDeleteModerator(@Req() req: Request, @Res() res: Response, @Body() deleteModeratorDto: AdminDeleteModeratorDto) {
        const adminId = req['user'].id as string;
        const result = await this.userService.adminDeleteModerator(adminId, deleteModeratorDto);
        res.status(result.StatuCode).send(result);
    }
}
