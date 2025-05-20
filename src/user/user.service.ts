import { AdminAddModeratorDto } from './dto/admin-add-moderator.dto';
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
import {
    And,
    Between,
    DataSource,
    EntityManager,
    In,
    Like,
    Not,
    Repository,
} from 'typeorm';
import { User, UserStatus } from 'src/common/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import bycypt from 'bcrypt';
import { LoginType } from './dto/login-user.dto';
import { Result } from 'src/common/result/Result';
import { DEFAULT_AVATAR_URL, MessageConstant } from 'src/common/constants';
import { JwtService } from '@nestjs/jwt';
import {
    ContentStatus,
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
import { PaginationUserDto } from './dto/pagination-user.dto';
import { AdminAddUserDto } from './dto/admin-add-user.dto';
import { AdminDeleteModeratorDto } from './dto/admin-delete-moderator.dto';
import { UserLog, UserLogType } from 'src/common/entity/user_log.entity';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';

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
    async create(
        email: string,
        username?: string,
        managed_communities?: string[],
    ): Promise<User> {
        // 创建一个用户对象
        const user = this.manager.create(User, { email });
        // 通过数据表中用户的个数来生成一个默认的用户名,
        user.username = `user_${await this.manager.count(User)}`;

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
        const where = {};
        if (type === LoginType.VERIFY_CODE) {
            where['email'] = value;
        }
        if (type === LoginType.USERNAME) {
            if (value.includes('@')) {
                where['email'] = value;
            } else {
                where['username'] = value;
            }
        }
        // 根据用户名、邮箱、手机号查找用户
        const user = await this.manager.findOne(User, {
            where,
        });
        return user;
    }
    async findOneById(userId: string) {
        return await this.getUserData(userId);
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
        await this.createActiveLog(user);
        // 获取粉丝数
        const fansCount = await this.manager.count(Interaction, {
            where: {
                target_type: TargetType.USER,
                type: InteractionType.FOLLOW,
                target_user_id: userId,
            },
            relations: ['user'],
        });
        // 获取关注数
        const followCount = await this.manager.count(Interaction, {
            where: {
                target_type: TargetType.USER,
                type: InteractionType.FOLLOW,
                user: {
                    id: userId,
                },
            },
            relations: ['user'],
        });
        // 获取收藏数
        const collectCount = await this.manager.count(Interaction, {
            where: {
                user: {
                    id: userId,
                },
                type: InteractionType.COLLECT,
            },
        });
        // 返回的数据
        const data = {
            id: user.id,
            username: user.username,
            phone: user.phone
                ? user.phone.substring(0, 3) +
                  '****' +
                  user.phone.substring(7, 11)
                : null,
            email: user.email,
            profile: user.profile,
            level: user.level,
            roles: user.roles.map((role) => role.role_name),
            is_default_password: user.is_default_password,
            fans_count: fansCount,
            follow_count: followCount,
            collect_count: collectCount,
        };

        return Result.success(MessageConstant.SUCCESS, data);
    }
    //更新用户资料
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
    async getUserDynamicContentList(targetUserId: string, userId: string) {
        const conUser = await this.manager.findOneBy(User, { id: userId });
        const status: ContentStatus[] = [ContentStatus.APPROVED];
        if (conUser) {
            if (conUser.id === targetUserId) {
                status.push(
                    ContentStatus.APPROVED,
                    ContentStatus.PENDING,
                    ContentStatus.REJECTED,
                    ContentStatus.HIDDEN,
                );
            }
        }
        const dynamicContentList = await this.manager.find(UserContent, {
            where: {
                user: {
                    id: targetUserId,
                },
                type: UserContentType.POST,
                status: In(status),
            },
            relations: ['user'],
        });
        const data = await Promise.all(
            dynamicContentList.map(async (content) => {
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
                        id: content.user.id,
                        nickname: content.user.profile.nickname
                            ? content.user.profile.nickname
                            : content.user.username,
                        avatar_url: content.user.profile.avatar_url,
                        level: content.user.level.level,
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
    async getUserUploadContentList(targetUserId: string, userId: string) {
        const conUser = await this.manager.findOneBy(User, { id: userId });
        const status: ContentStatus[] = [ContentStatus.APPROVED];
        if (conUser) {
            if (conUser.id === targetUserId) {
                status.push(
                    ContentStatus.APPROVED,
                    ContentStatus.PENDING,
                    ContentStatus.REJECTED,
                    ContentStatus.HIDDEN,
                );
            }
        }
        const uploadContentList = await this.manager.find(UserContent, {
            where: {
                user: {
                    id: targetUserId,
                },
                type: In([
                    UserContentType.GUIDE,
                    UserContentType.RESOURCE,
                    UserContentType.NEWS,
                ]),
                status: In(status),
            },
            relations: ['user'],
        });
        const data = await Promise.all(
            uploadContentList.map(async (content) => {
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
                        id: content.user.id,
                        nickname: content.user.profile.nickname
                            ? content.user.profile.nickname
                            : content.user.username,
                        avatar_url: content.user.profile.avatar_url,
                        level: content.user.level.level,
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
    // 管理员分页获取用户数据
    async getAdminUsersPaginated(
        paginationUserDto: PaginationUserDto,
        userId: string,
    ) {
        // 检查是否是管理员
        const user = await this.manager.findOneBy(User, { id: userId });

        if (
            !user?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        // 提取数据
        const { page, pageSize, status, search, sortField, sortOrder, roles } =
            paginationUserDto;

        // 筛选条件
        const where = {};
        if (status) {
            where['status'] = In(status.split(','));
        }
        if (search) {
            where['username'] = Like(`%${search}%`);
        }
        if (roles) {
            where['roles'] = { role_name: In(roles.split(',')) };
        }
        if (!status) {
            where['status'] = Not(ContentStatus.DELETED);
        }
        // 排序条件
        const order = {};
        if (sortField) {
            order[sortField] = sortOrder === 'asc' ? 'ASC' : 'DESC';
        }

        // 分页查询
        const [data, total] = await this.manager.findAndCount(User, {
            where,
            order,
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        // 格式化数据
        const result = {
            items: data.map((user) => {
                return {
                    id: user.id,
                    username: user.username,
                    phone: user.phone
                        ? user.phone.substring(0, 3) +
                          '****' +
                          user.phone.substring(7, 11)
                        : null,
                    email: user.email,
                    status: user.status,
                    role: user.roles[0].role_name,
                    managed_communities: user.managed_communities.map(
                        (game) => ({
                            title: game.title,
                            id: game.id,
                            key: game.id,
                        }),
                    ),
                    create_time: user.create_time,
                    last_login_time: user.last_login_time,
                };
            }),
            total,
            page,
            pageSize,
        };

        return Result.success(MessageConstant.SUCCESS, result);
    }
    // 管理员修改用户信息
    async updateAdminUser(
        userId: string,
        updateUserDto: UpdateUserDto,
        adminId: string,
    ) {
        // 检查是否是管理员
        const admin = await this.manager.findOneBy(User, { id: adminId });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        // 找到要修改的用户
        const { username, email, status, role, managed_communities } =
            updateUserDto;
        // 找到要修改的用户
        const userToUpdate = await this.manager.findOneBy(User, { id: userId });
        // 验证用户是否存在
        if (!userToUpdate) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }

        // 获取角色
        const updateRole = await this.manager.findOneBy(Role, {
            role_name: role,
        });
        // 只有超级管理员才能任命管理员
        if (
            updateRole?.role_name === 'ADMIN' &&
            admin.roles[0].role_name !== 'SUPER_ADMIN'
        ) {
            return Result.error(
                MessageConstant.USER_NOT_SUPER_ADMIN,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证角色是否存在
        if (updateRole) {
            // 用户的Roles中没有这个角色，则添加
            if (!userToUpdate.roles.some((role) => role === updateRole)) {
                userToUpdate.roles = [updateRole];
            }
        }
        // 更新
        userToUpdate.username = username;
        userToUpdate.email = email;
        userToUpdate.status = status;
        // 更新管理的社区
        const manage_games = await this.manager.find(Game, {
            where: {
                id: In(managed_communities.map((item) => item.id)),
            },
        });
        userToUpdate.managed_communities = manage_games;
        // 如果用户角色不为MODERATOR，则清空管理的社区
        if (userToUpdate.roles[0].role_name !== 'MODERATOR') {
            userToUpdate.managed_communities = [];
        }
        // 如果用户管理的社区为空，则将用户角色设置为USER
        if (userToUpdate.managed_communities.length === 0) {
            userToUpdate.roles = [
                (await this.manager.findOneBy(Role, {
                    role_name: 'USER',
                })) as Role,
            ];
        }

        const result = await this.manager.save(userToUpdate);
        // 更新用户信息
        return Result.success(MessageConstant.SUCCESS, {
            id: result.id,
            username: result.username,
            email: result.email,
            status: result.status,
            role: result.roles[0].role_name,
            phone: result.phone
                ? result.phone.substring(0, 3) +
                  '****' +
                  result.phone.substring(7, 11)
                : null,
            managed_communities: result.managed_communities.map((game) => ({
                title: game.title,
                id: game.id,
                key: game.id,
            })),
            create_time: result.create_time,
            last_login_time: result.last_login_time,
        });
    }
    // 管理员添加用户
    async addAdminUser(addUserDto: AdminAddUserDto, adminId: string) {
        // 检查是否是管理员
        const admin = await this.manager.findOneBy(User, { id: adminId });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        const { username, email, role, managed_communities } = addUserDto;
        // 验证角色是否存在
        const updateRole = await this.manager.findOneBy(Role, {
            role_name: role,
        });
        if (!updateRole) {
            return Result.error(
                MessageConstant.ROLE_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证是否有创建管理员用户的权限
        if (
            (updateRole.role_name === 'ADMIN' ||
                updateRole.role_name === 'SUPER_ADMIN') &&
            admin.roles[0].role_name !== 'SUPER_ADMIN'
        ) {
            return Result.error(
                MessageConstant.USER_NOT_SUPER_ADMIN,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证社区是否存在
        const manage_games = await this.manager.find(Game, {
            where: {
                id: In(managed_communities.map((item) => item.id)),
            },
        });
        if (manage_games.length !== managed_communities.length) {
            return Result.error(
                MessageConstant.GAME_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证用户名是否存在
        const count = await this.manager.countBy(User, { username });
        if (count > 0) {
            return Result.error(
                MessageConstant.USERNAME_ALREADY_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证邮箱是否存在
        const countEmail = await this.manager.countBy(User, { email });
        if (countEmail > 0) {
            return Result.error(
                MessageConstant.EMAIL_ALREADY_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 创建用户
        const user = new User();
        user.username = username;
        user.email = email;
        user.status = UserStatus.ACTIVE;
        // 使用uuid生成一个默认密码
        const ps = randomUUID();

        // 加密密码
        const salt = await bycypt.genSalt();
        user.password = await bycypt.hash(ps, salt);
        user.last_login_time = new Date();
        // 初始化用户角色
        user.roles = [updateRole];
        // 初始化用户资料
        const userProfle = this.manager.create(UserProfile, {
            avatar_url: DEFAULT_AVATAR_URL,
        });
        user.profile = userProfle;

        // 初始化用户等级
        const userLevel = this.manager.create(UserLevel, {});
        user.level = userLevel;

        // 初始化用户管理的社区
        user.managed_communities = manage_games;
        if (user.managed_communities.length === 0) {
            user.roles = [
                (await this.manager.findOneBy(Role, {
                    role_name: 'USER',
                })) as Role,
            ];
        }
        // 保存用户对象到数据库
        const resultUser = await this.manager.save(user);
        // 格式化返回数据
        return Result.success(MessageConstant.SUCCESS, {
            id: resultUser.id,
            username: resultUser.username,
            email: resultUser.email,
            status: resultUser.status,
            role: resultUser.roles[0].role_name,
            phone: resultUser.phone
                ? resultUser.phone.substring(0, 3) +
                  '****' +
                  resultUser.phone.substring(7, 11)
                : null,
            managed_communities: resultUser.managed_communities.map((game) => ({
                title: game.title,
                id: game.id,
                key: game.id,
            })),
            create_time: resultUser.create_time,
            last_login_time: resultUser.last_login_time,
        });
    }
    // 管理员删除用户
    async adminDeleteUser(userIds: string[], adminId: string) {
        // 检查是否是管理员
        const admin = await this.manager.findOneBy(User, { id: adminId });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        // 检查要删除的用户是否包含自己
        if (userIds.includes(adminId)) {
            return Result.error(
                MessageConstant.ADMIN_CAN_NOT_DELETE_SELF,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 找到要删除的用户
        const usersToDelete = await this.manager.find(User, {
            where: {
                id: In(userIds),
            },
        });
        // 验证用户是否存在
        if (usersToDelete.length !== userIds.length) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证待删除的用户中是否有超级管理员
        if (
            usersToDelete.some((user) =>
                user.roles.some(
                    (role) =>
                        role.role_name === 'ADMIN' ||
                        role.role_name === 'SUPER_ADMIN',
                ),
            )
        ) {
            // 只有超级管理员才能删除管理员
            if (admin.roles[0].role_name !== 'SUPER_ADMIN') {
                return Result.error(
                    MessageConstant.USER_NOT_SUPER_ADMIN,
                    HttpStatus.BAD_REQUEST,
                    null,
                );
            }
        }
        const userToSave = usersToDelete.map((user) => {
            user.status = UserStatus.DELETED;
            return user;
        });
        // 删除用户（软删除，状态置为删除）
        await this.manager.save(userToSave);

        // 格式化返回数据
        return Result.success(MessageConstant.SUCCESS, null);
    }

    // 管理员改变用户状态
    async adminChangeUserStatus(
        userIds: string[],
        status: UserStatus,
        adminId: string,
    ) {
        // 检查是否是管理员
        const admin = await this.manager.findOneBy(User, { id: adminId });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        // 验证待修改状态的用户是否包含自己
        if (userIds.includes(adminId)) {
            return Result.error(
                MessageConstant.ADMIN_CAN_NOT_CHANGE_SELF_STATUS,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 找到要修改状态的用户
        const usersToUpdate = await this.manager.find(User, {
            where: {
                id: In(userIds),
            },
        });
        // 验证用户是否存在
        if (usersToUpdate.length !== userIds.length) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }

        // 验证待修改状态的用户中是否有超级管理员
        if (
            usersToUpdate.some((user) =>
                user.roles.some(
                    (role) =>
                        role.role_name === 'ADMIN' ||
                        role.role_name === 'SUPER_ADMIN',
                ),
            )
        ) {
            // 只有超级管理员才能修改管理员状态
            if (admin.roles[0].role_name !== 'SUPER_ADMIN') {
                return Result.error(
                    MessageConstant.USER_NOT_SUPER_ADMIN,
                    HttpStatus.BAD_REQUEST,
                    null,
                );
            }
        }
        const userToSave = usersToUpdate.map((user) => {
            user.status = status;
            return user;
        });
        // 修改用户状态
        await this.manager.save(userToSave);

        // 格式化返回数据
        return Result.success(MessageConstant.SUCCESS, null);
    }
    // 管理员添加版主搜索用户
    async adminSearchUser(adminID: string, search: string) {
        // 检查是否是管理员
        const admin = await this.manager.findOneBy(User, { id: adminID });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        const users = await this.manager.find(User, {
            where: {
                username: Like(`%${search}%`),
                roles: {
                    role_name: In(['USER', 'MODERATOR']),
                },
            },
        });
        const data = users.map((user) => {
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.profile.avatar_url,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }
    // 管理员添加版主
    async adminAddModerator(
        adminID: string,
        adminAddModeratorDto: AdminAddModeratorDto,
    ) {
        // 检查是否是管理员
        const admin = await this.manager.findOneBy(User, { id: adminID });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        const { user_id, community_id } = adminAddModeratorDto;
        // 找到用户
        const user = await this.manager.findOneBy(User, { id: user_id });
        // 验证用户是否存在
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 如果用户角色为ADMIN或SUPER_ADMIN，则不能成为版主
        if (
            user.roles[0].role_name === 'ADMIN' ||
            user.roles[0].role_name === 'SUPER_ADMIN'
        ) {
            return Result.error(
                MessageConstant.ADMIN_NOT_ALLOW_BECOME_MODERATOR,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 找到游戏
        const game = await this.manager.findOneBy(Game, { id: community_id });
        // 验证游戏是否存在
        if (!game) {
            return Result.error(
                MessageConstant.GAME_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证用户是否已经是游戏的版主
        if (user.managed_communities.some((item) => item.id === community_id)) {
            return Result.error(
                MessageConstant.USER_ALREADY_MOD,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 添加游戏版主
        user.managed_communities.push(game);
        const savedUser = await this.manager.save(user);

        // 格式化返回数据
        return Result.success(MessageConstant.SUCCESS, {
            id: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            avatar_url: savedUser.profile.avatar_url,
        });
    }
    // 管理员删除版主
    async adminDeleteModerator(
        adminID: string,
        adminDeleteModeratorDto: AdminDeleteModeratorDto,
    ) {
        // 检查是否是管理员
        const admin = await this.manager.findOneBy(User, { id: adminID });
        if (
            !admin?.roles.some(
                (role) =>
                    role.role_name === 'ADMIN' ||
                    role.role_name === 'SUPER_ADMIN',
            )
        ) {
            return Result.error(
                MessageConstant.USER_NOT_ADMIN,
                HttpStatus.NOT_ACCEPTABLE,
                null,
            );
        }
        const { user_id, community_id } = adminDeleteModeratorDto;
        // 找到用户
        const user = await this.manager.findOneBy(User, { id: user_id });
        // 验证用户是否存在
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 找到游戏
        const game = await this.manager.findOneBy(Game, { id: community_id });
        // 验证游戏是否存在
        if (!game) {
            return Result.error(
                MessageConstant.GAME_NOT_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 验证用户是否已经是游戏的版主
        if (
            !user.managed_communities.some((item) => item.id === community_id)
        ) {
            return Result.error(
                MessageConstant.USER_NOT_MOD,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 删除游戏版主
        user.managed_communities = user.managed_communities.filter(
            (item) => item.id !== community_id,
        );
        // 管理社区数量为0时，设置为USER角色
        if (user.managed_communities.length === 0) {
            const role = await this.manager.findOneBy(Role, {
                role_name: 'USER',
            });
            if (role) {
                user.roles = [role];
            }
        }
        await this.manager.save(user);
        await this.manager.increment(
            Game,
            { id: community_id },
            'moderator_count',
            -1,
        );
        // 格式化返回数据
        return Result.success(MessageConstant.SUCCESS, null);
    }

    async createLoginLog(user: User) {
        const loginLog = this.manager.create(UserLog, {
            user,
            type: UserLogType.LOGIN,
            content: '登录',
        });
        await this.manager.save(loginLog);
        // 更新用户最后登录时间
        user.last_login_time = new Date();
        await this.manager.save(user);
    }

    async createActiveLog(user: User) {
        if (!user) {
            return;
        }
        const activeLog = this.manager.create(UserLog, {
            type: UserLogType.ACTIVE,
            content: '活跃',
        });
        activeLog.user = user;
        const saved = await this.manager.save(activeLog);
        // 更新用户活跃时间
        user.update_time = new Date();
        await this.manager.save(user);
        // 判断用户是不是今天的第一次活跃
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        const count = await this.manager.count(UserLog, {
            where: {
                user: {
                    id: user.id,
                },
                type: UserLogType.ACTIVE,
                created_at: Between(todayStart, todayEnd),
            },
            relations: ['user'],
        });
        if (count === 1) {
            user.level.ex += 10;
            await this.manager.save(user);
        }
    }
}
