import bycypt from 'bcrypt';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { LoginType, LoginUserDto } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { access } from 'fs';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @InjectRedis() private readonly redisClient: Redis,
    ) {}
    /**
     * 验证用户
     * @param loginUserDto 登录用户信息
     * @returns
     */
    async validateUser(loginUserDto: LoginUserDto) {
        if (!loginUserDto) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }

        // 获取登录类型、密码、账号
        const { type, password, account } = loginUserDto;

        // 验证码登录
        if (type === LoginType.PHONE) {
            // 从redis中获取验证码
            const code = await this.redisClient.get(account);
            // 验证码不存在或者过期
            if (!code || code !== password) {
                return Result.error(
                    MessageConstant.CODE_ERROR,
                    HttpStatus.UNAUTHORIZED,
                    null,
                );
            }
        }

        // 查询用户
        let user = await this.userService.findOneByType(account, type);

        // 用户不存在
        if (!user) {
            // 登录类型为手机号
            if (type === LoginType.PHONE) {
                // 创建新用户
                user = await this.userService.create(account);
            } else {
                return Result.error(
                    MessageConstant.USER_NOT_EXIST,
                    HttpStatus.NOT_FOUND,
                    null,
                );
            }
        }

        // 校验密码
        if (
            (await bycypt.compare(password, user.password)) ||
            type === LoginType.PHONE
        ) {
            // 生成token
            const payload = { id: user.id };
            const token = await this.jwtService.signAsync(payload);

            return Result.success(MessageConstant.SUCCESS, {
                token,
                user_id: user.id,
            });
        }
        // 密码错误
        return Result.error(
            MessageConstant.PASSWORD_ERROR,
            HttpStatus.UNAUTHORIZED,
            null,
        );
    }
    // 获取验证码
    async getVerifyCode(phone: string) {
        if (!phone || phone.length !== 11 || !/^\d+$/.test(phone)) {
            return Result.error(
                MessageConstant.ILLEGAL_VALUE,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }

        // #TODO 使用api接口发送验证码
        // 生成验证码
        const code = Math.floor(Math.random() * 1000000).toString();
        await this.redisClient.setex(phone, 60, code);
        this.logger.log(`验证码：${code}`);

        return Result.success(MessageConstant.SUCCESS, null);
    }
}
