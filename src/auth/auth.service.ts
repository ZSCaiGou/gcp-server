import bycypt from 'bcrypt';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { access } from 'fs';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(loginUserDto: LoginUserDto) {
        this.logger.log(`loginUserDto: ${loginUserDto.type}`);

        // 获取登录类型、密码、账号
        const { type, password, account: accout } = loginUserDto;

        // 根据登录类型和密码查询用户
        const user = await this.userService.findOneByType(accout, type);
        this.logger.log(`user: ${user?.username}`);
        // 用户不存在
        if (!user) {
            return  Result.error(MessageConstant.USER_NOT_EXIST,HttpStatus.NOT_FOUND,null);
        }
        // 校验密码
        if (await bycypt.compare(password, user.password)) {
            // 生成token
            const payload = { sub: user.id, username: user.username };
            const token = await this.jwtService.signAsync(payload);
            this.logger.log(`token: ${token}`);
            return Result.success(MessageConstant.SUCCESS, { token });
        }
        // 密码错误
        return Result.error(MessageConstant.PASSWORD_ERROR,HttpStatus.UNAUTHORIZED,null);
    }
}
