import { OssUtilService } from './../utils/oss-util/oss-util.service';
import {
    BadRequestException,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { User, UserStatus } from 'src/common/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import bycypt from 'bcrypt';
import { LoginType } from './dto/login-user.dto';
import { Result } from 'src/common/result/Result';
import { DEFAULT_AVATAR_URL, MessageConstant } from 'src/common/constants';
import { JwtService } from '@nestjs/jwt';
import {
    UserContent,
    UserContentType,
} from 'src/common/entity/user_content.entity';
import { randomUUID } from 'crypto';
import { Role } from 'src/common/entity/role.entity';
import { UserProfile } from 'src/common/entity/user_profile.entity';
import { UserLevel } from 'src/common/entity/user_level.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Game } from 'src/common/entity/game.entity';
import { Topic } from 'src/common/entity/topic.entity';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    private manager: EntityManager;
    constructor(
        private dataSource: DataSource,
        private readonly OssUtilService: OssUtilService,
    ) {
        this.manager = this.dataSource.manager;
    }
    /**
     * 创建用户
     * @param   用户信息
     * @returns  用户对象
     */
    async create(phone: string): Promise<User> {
        // 创建一个用户对象
        const user = this.manager.create(User, { phone });
        // 通过手机号生成一个默认的用户名,将中间四位替换成*
        user.username =
            'user_' + phone.substring(0, 3) + '****' + phone.substring(7, 11);

        // 使用uuid生成一个默认密码
        const ps = randomUUID();

        // 加密密码
        const salt = await bycypt.genSalt();
        user.password = await bycypt.hash(ps, salt);
        user.last_login_time = new Date();

        // 初始化用户角色
        const role = await this.manager.findOneBy(Role, { role_name: 'USER' });
        if (!role) {
            throw new BadRequestException('内部错误');
        }
        user.roles = [role];

        // 初始化用户资料
        const userProfle = this.manager.create(UserProfile, {
            avatar_url: DEFAULT_AVATAR_URL,
        });
        user.profile = userProfle;

        // 初始化用户等级
        const userLevel = this.manager.create(UserLevel, {});
        user.level = userLevel;

        // 保存用户对象到数据库
        const resultUser = await this.manager.save(user);

        // #TODO: 添加日志记录和错误处理

        // 返回用户
        return resultUser;
    }

    /**
     * 登录
     * @param   用户名、邮箱、手机号、密码
     * @returns  用户对象
     */
    async findOneByType(value: string, type: LoginType) {
        // 根据用户名、邮箱、手机号查找用户
        const user = await this.manager.findOneBy(User, {
            [type]: value,
        });
        return user;
    }

    /**
     *  获取用户信息
     */
    async getUserData(userId: string) {
        if (!userId) {
            return Result.error(
                MessageConstant.ILLEGAL_VALUE,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        const user = await this.manager.findOneBy(User, { id: userId });
        // 用户不存在
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 禁用用户不能登录
        if (user.status === UserStatus.DISABLED) {
            return Result.error(
                MessageConstant.USER_DISABLED,
                HttpStatus.FORBIDDEN,
                null,
            );
        }
        // 返回的数据
        const data = {
            id: user.id,
            username: user.username,
            phone:
                user.phone.substring(0, 3) +
                '****' +
                user.phone.substring(7, 11),
            email: user.email,
            profile: user.profile,
            level: user.level,
            roles: user.roles.map((role) => role.role_name),
        };

        return Result.success(MessageConstant.SUCCESS, data);
    }

    async updateUserProfile(
        userId: string,
        updateUserProfileDto: UpdateUserProfileDto,
    ) {
        const { username, email, nickname, signature } = updateUserProfileDto;
        const user = await this.manager.findOneBy(User, { id: userId });
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 修改用户名
        if (username && username !== user.username) {
            const count = await this.manager.countBy(User, { username });
            if (count > 0) {
                return Result.error(
                    MessageConstant.USERNAME_ALREADY_EXIST,
                    HttpStatus.BAD_REQUEST,
                    null,
                );
            }
            user.username = username;
        }
        // 修改邮箱
        if (email && email !== user.email) {
            const count = await this.manager.countBy(User, { email });
            if (count > 0) {
                return Result.error(
                    MessageConstant.EMAIL_ALREADY_EXIST,
                    HttpStatus.BAD_REQUEST,
                    null,
                );
            }
            user.email = email;
        }
        // 修改昵称
        if (user.profile.nickname !== nickname && nickname) {
            user.profile.nickname = nickname;
        }
        // 用户的个性签名
        if (!user.profile.bio) {
            user.profile.bio = {
                signature: signature,
                sex: '',
                birthday: {
                    year: 0,
                    month: 0,
                    day: 0,
                },
                address: {
                    contry: '',
                    city: '',
                    district: '',
                },
            };
        } else {
            user.profile.bio.signature = signature;
        }

        await this.manager.save(user);
        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 修改用户头像
    async updateUserAvatar(useId: string, avatar: Express.Multer.File) {
        const user = await this.manager.findOneBy(User, { id: useId });
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        const avatarName = randomUUID() + '.' + avatar.mimetype.split('/')[1];
        const ossUrl = await this.OssUtilService.uploadAvatar(
            avatar,
            avatarName,
        );
        user.profile.avatar_url = ossUrl;
        await this.manager.save(user);
        return Result.success(MessageConstant.SUCCESS, null);
    }

    // 获取用户动态
    async getUserDynamicContentList(userId: string) {
        const dynamicContentList = await this.manager.findBy(UserContent, {
            user_id: userId,
            type: UserContentType.POST,
        });
        const data = await Promise.all(
            dynamicContentList.map(async (content) => {
                const createUser = await this.manager.findOne(User, {
                    where: {
                        id: content.user_id,
                    },
                });
                // 获取游戏标签
                const gameTags: Game[] = await this.manager.findBy(Game, {
                    id: In(content.game_ids),
                });

                // 获取话题标签
                const topicTags: Topic[] = await this.manager.findBy(Topic, {
                    id: In(content.topic_ids),
                });

                return {
                    id: content.id,
                    title: content.title,
                    cover_url: content.cover_url,
                    create_time: content.create_time,
                    content: content.content,
                    type: content.type,
                    user_info: {
                        id: createUser?.id,
                        nickname: createUser?.profile.nickname
                            ? createUser?.profile.nickname
                            : createUser?.username,
                        avatar_url: createUser?.profile.avatar_url,
                        level: createUser?.level.level,
                    },
                    game_tags: gameTags.map((game) => ({
                        id: game.id,
                        title: game.title,
                        game_img_url: game.game_img_url,
                    })),
                    topic_tags: topicTags.map((topic) => ({
                        id: topic.id,
                        title: topic.title,
                    })),
                };
            }),
        );

        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 获取用户投稿内容列表
    async getUserUploadContentList(userId: string) {
        const uploadContentList = await this.manager.findBy(UserContent, {
            user_id: userId,
            type: In([
                UserContentType.GUIDE,
                UserContentType.RESOURCE,
                UserContentType.NEWS,
            ]),
        });
        const data = await Promise.all(
            uploadContentList.map(async (content) => {
                const createUser = await this.manager.findOne(User, {
                    where: {
                        id: content.user_id,
                    },
                });
                // 获取游戏标签
                const gameTags: Game[] = await this.manager.findBy(Game, {
                    id: In(content.game_ids),
                });

                // 获取话题标签
                const topicTags: Topic[] = await this.manager.findBy(Topic, {
                    id: In(content.topic_ids),
                });

                return {
                    id: content.id,
                    title: content.title,
                    cover_url: content.cover_url,
                    create_time: content.create_time,
                    content: content.content,
                    type: content.type,
                    user_info: {
                        id: createUser?.id,
                        nickname: createUser?.profile.nickname
                            ? createUser?.profile.nickname
                            : createUser?.username,
                        avatar_url: createUser?.profile.avatar_url,
                        level: createUser?.level.level,
                    },
                    game_tags: gameTags.map((game) => ({
                        id: game.id,
                        title: game.title,
                        game_img_url: game.game_img_url,
                    })),
                    topic_tags: topicTags.map((topic) => ({
                        id: topic.id,
                        title: topic.title,
                    })),
                };
            }),
        );

        return Result.success(MessageConstant.SUCCESS, data);
    }

    // #TODO 增加用户经验
    async addUserExp(userId: string, exp: number) {}
}
