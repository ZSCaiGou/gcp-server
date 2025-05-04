import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { SendVerifyCodeDto } from './dto/send-verifycode.dto';
import { SmtpService } from './../utils/smtp/smtp.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSafeDto } from './dto/create-safe.dto';
import { UpdateSafeDto } from './dto/update-safe.dto';
import { EntityManager, DataSource } from 'typeorm';
import { User } from 'src/common/entity/user.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { UpdatePasswordDto } from './dto/update-password.dto';
import bycypt from 'bcrypt';
@Injectable()
export class SafeService {
    private manager: EntityManager;
    constructor(
        private readonly dataSource: DataSource,
        private readonly smtpService: SmtpService,
        @InjectRedis() private readonly redisClient: Redis,
    ) {
        this.manager = this.dataSource.manager;
    }
    // 获取验证码
    async sendVerifyCode(userId: string, sendVerifyCodeDto: SendVerifyCodeDto) {
        const { type, account } = sendVerifyCodeDto;
        const user = await this.manager.findOneBy(User, { id: userId });
        // 验证用户
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        if (type === 'email') {
            if (user.email !== account) {
                if (account !== 'password') {
                    return Result.error(
                        MessageConstant.EMAIL_NOT_MATCH,
                        HttpStatus.BAD_REQUEST,
                        null,
                    );
                }
            }
            //随机生成验证码
            const code = Math.floor(Math.random() * 1000000).toString();
            await this.redisClient.setex(user.email, 60 * 5, code);
            // 发送邮件验证码
            // await this.smtpService.sendEmail(user.email, '验证码', code);
            console.log(`验证码：${code}`);
        } else {
            if (user.phone !== account) {
                return Result.error(
                    MessageConstant.PHONE_NOT_MATCH,
                    HttpStatus.BAD_REQUEST,
                    null,
                );
            }
            //随机生成验证码
            const code = Math.floor(Math.random() * 1000000).toString();
            await this.redisClient.setex(account, 60 * 5, code);
            // 发送短信验证码
            // await this.smsService.sendSms(user.phone, code);
            console.log(`验证码：${code}`);
        }
        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 更新手机号
    async updatePhone(userId: string, updatePhoneDto: UpdatePhoneDto) {
        const { code, newPhone, originalPhone } = updatePhoneDto;
        const user = await this.manager.findOneBy(User, { id: userId });
        // 验证用户
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 原手机号和数据库中的手机号不匹配
        if (originalPhone && user.phone !== originalPhone) {
            return Result.error(
                MessageConstant.PHONE_NOT_MATCH,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        let verifyCode: string | null;
        if (originalPhone) {
            verifyCode = await this.redisClient.get(originalPhone);
        } else {
            verifyCode = await this.redisClient.get(newPhone);
        }

        if (!verifyCode || verifyCode !== code) {
            return Result.error(
                MessageConstant.CODE_ERROR,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 检测手机号是否已被注册
        const phoneUser = await this.manager.findOneBy(User, { phone: newPhone });
        if (phoneUser) {
            return Result.error(
                MessageConstant.PHONE_ALREADY_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 更新手机号
        user.phone = newPhone;
        await this.manager.save(user);
        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 更新邮箱
    async updateEmail(userId:string,updateEmailDto: UpdateEmailDto){
        const { originalEmail, newEmail, code } = updateEmailDto;
        const user = await this.manager.findOneBy(User, { id: userId });
        // 验证用户
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 原邮箱和数据库中的邮箱不匹配
        if (originalEmail && user.email !== originalEmail) {
            return Result.error(
                MessageConstant.EMAIL_NOT_MATCH,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        let verifyCode: string | null;
        if (originalEmail) {
            verifyCode = await this.redisClient.get(originalEmail);
        } else {
            verifyCode = await this.redisClient.get(newEmail);
        }
        if (!verifyCode || verifyCode !== code) {
            return Result.error(
                MessageConstant.CODE_ERROR,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 检测邮箱是否已被注册
        const emailUser = await this.manager.findOneBy(User, { email: newEmail });
        if (emailUser) {
            return Result.error(
                MessageConstant.EMAIL_ALREADY_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 更新邮箱
        user.email = newEmail;
        await this.manager.save(user);

        return Result.success(MessageConstant.SUCCESS, null);
    }

    //更新密码
    async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
        const user = await this.manager.findOneBy(User, { id: userId });
        // 验证用户
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        const { oldPassword, newPassword, code } = updatePasswordDto;
        // 验证密码
        if (oldPassword && user.password !== oldPassword) {
            return Result.error(
                MessageConstant.PASSWORD_ERROR,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        let verifyCode: string | null;
        // 没有原密码时，验证邮箱验证码
        if (!oldPassword) {
            verifyCode = await this.redisClient.get(user.email);
        } else {
            verifyCode = null;
        }
        if (!verifyCode || verifyCode !== code) {
            return Result.error(
                MessageConstant.CODE_ERROR,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 更新密码
        const salt = await bycypt.genSalt();
        user.password = await bycypt.hash(newPassword, salt);
        user.is_default_password = false;
        await this.manager.save(user);
        return Result.success(MessageConstant.SUCCESS, null);
    }
    //更新用户名
    async updateUserName(userId: string, userName: string){
        const user = await this.manager.findOneBy(User, { id: userId });
        // 验证用户
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 更新用户名
        user.username = userName;
        await this.manager.save(user);
        return Result.success(MessageConstant.SUCCESS, null);
    }
    
}
