import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/common/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import bycypt from 'bcrypt';
import { LoginType } from './dto/login-user.dto';
@Injectable()
export class UserService {

    private readonly logger = new Logger(UserService.name);

    constructor(
        private dataSource: DataSource,
        @InjectRepository(User) private userRepostory: Repository<User>,
    ) {}
    /**
     * 创建用户
     * @param createUserDto  用户信息
     * @returns
     */
    async create(createUserDto: CreateUserDto) {
        // 创建一个事务
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();
        // 开始事务
        try {
            // 创建一个用户对象
            const user = new User();
            // 将dto中的数据合并到用户对象中
            this.userRepostory.merge(user, createUserDto);
            user.last_login_time = new Date();
            // 加密密码
            const salt = await bycypt.genSalt();
            user.password = await bycypt.hash(createUserDto.password, salt);
            // 保存用户对象到数据库
            await this.userRepostory.save(user);

            // #TODO: 初始化用户相关的其他表数据
            
            // 提交事务
            await runner.commitTransaction();
        } catch (error) {
            // 回滚事务
            await runner.rollbackTransaction();
            // #TODO: 添加日志记录和错误处理
            throw error;
        } finally {
            await runner.release();
        }
        // TODO: 返回一个用户成功登录TOKEN
        return 'This action adds a new user';
    }

    findAll() {
        return `This action returns all user`;
    }

    async findOne(id: string) {
        const user = await this.userRepostory.findOneBy({
            id,
        });
        this.logger.log('uuid', id)
        this.logger.log('user', user)
        return {
            user
        };
    }

    async findOneByType(value: string, type: LoginType) {
        // 根据用户名、邮箱、手机号查找用户
        const user = await this.userRepostory.findOneBy({
            [type]: value,
        });
        return user;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
