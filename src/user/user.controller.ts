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

@Controller('user')
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

    @Post('create')
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Res() res: Response) {
        const data = await this.userService.findOne(id);

        const result = Result.success(MessageConstant.SUCCESS, data);

        res.status(result.StatuCode).send(result);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
}
