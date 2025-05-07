import {
    Column,
    Entity,
    Generated,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { UserProfile } from './user_profile.entity';
import { UserLevel } from './user_level.entity';
import { Game } from './game.entity';
import { ModeratorRequest } from './moderator_request.entity';
import { UserLog } from './user_log.entity';
import { Interaction } from './interaction.entity';
import { Comment } from './comment.entity';
import { UserViewHistory } from './user_view_history.entity';
import { Notification } from './notification.entity';
import { Topic } from './topic.entity';
import { Resource } from './resource.entity';
import { SupportTicket } from './support_ticket.entity';

export enum UserStatus {
    ACTIVE = 'active',
    DISABLED = 'disabled',
    DELETED = 'deleted',
}

@Entity({
    comment: '用户表',
})
export class User {
    @PrimaryColumn({
        comment: '用户ID',
    })
    @Generated('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
        nullable: false,
        comment: '用户名',
    })
    username: string;

    @Column({
        type: 'varchar',
        length: 50,
        comment: '邮箱',
        default: null,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 50,
        comment: '手机号',
        default: null,
    })
    phone: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '密码',
        nullable: false,
    })
    password: string;

    @Column({
        type: 'boolean',
        default: true,
        comment: '是否为默认密码',
    })
    is_default_password: boolean;
    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    create_time: Date;

    @Column({
        type: 'timestamp',
        comment: '更新时间',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    update_time: Date;

    @Column({
        type: 'timestamp',
        comment: '最后登录时间',
    })
    last_login_time: Date;
    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
        comment: '用户状态',
    })
    status: UserStatus;

    // 用户角色
    @ManyToMany(() => Role, { eager: true })
    @JoinTable()
    roles: Role[];

    @ManyToMany(() => Game, {
        eager: true,
    })
    @JoinTable()
    managed_communities: Game[];

    // 用户资料
    @OneToOne(() => UserProfile, {
        eager: true,
        cascade: true,
    })
    @JoinColumn()
    profile: UserProfile;

    // 用户等级
    @OneToOne(() => UserLevel, {
        eager: true,
        cascade: true,
    })
    @JoinColumn()
    level: UserLevel;


    // 上传的资源
    @OneToMany(() => Resource, (resource) => resource.user)
    owned_resources: Resource[];

    // 用户版主申请
    @OneToMany(() => ModeratorRequest, (request) => request.user)
    moderator_requests: ModeratorRequest[];

    // 用户互动记录
    @OneToMany(() => Interaction, (it) => it.user)
    user_interactions: Interaction[];

    // 用户评论
    @OneToMany(() => Comment, (comment) => comment.user)
    user_comments: Comment[];

    // 用户浏览历史
    @OneToMany(() => UserViewHistory, (history) => history.user)
    view_history: UserViewHistory[];

    // 用户通知
    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    // 用户话题
    @OneToMany(() => Topic, (topic) => topic.user)
    created_topics: Topic[];

    // 用户工单
    @OneToMany(() => SupportTicket, (ticket) => ticket.user)
    support_tickets: SupportTicket[];

    // 用户日志
    @OneToMany(() => UserLog, (log) => log.user, {
        eager: true,
    })
    logs: UserLog[];
}
