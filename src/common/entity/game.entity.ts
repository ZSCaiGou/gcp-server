import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { CommunityLog } from './community_log.entity';
import { Resource } from './resource.entity';
import { ModeratorRequest } from './moderator_request.entity';
import { Category } from './category.entity';

export enum GameStatus {
    ACTIVE = 'active',
    DISABLED = 'disabled',
    DELETED = 'deleted',
}

@Entity({
    comment: '游戏(社区)信息',
})
export class Game {
    @PrimaryColumn({
        comment: '游戏ID',
        type: 'bigint',
        generated: true,
    })
    id: bigint;
    @Column({
        comment: '游戏名称',
        type: 'varchar',
        length: 255,
    })
    title: string;
    @Column({
        comment: '游戏描述',
        type: 'text',
        default: null,
    })
    description: string;

    @Column({
        comment: '游戏分类',
        type: 'json',
        default: null,
    })
    category: string[];

    @Column({
        comment: '游戏热度',
        type: 'int',
        default: 0,
    })
    hot_point: number;

    @Column({
        comment: '游戏标签',
        type: 'json',
        default: null,
    })
    tags: JSON;

    @Column({
        comment: '游戏封面',
        type: 'varchar',
    })
    game_img_url: string;

    @Column({
        comment: '创建时间',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
    @Column({
        comment: '更新时间',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    last_updated_at: Date;
    @Column({
        comment: '成员数量',
        type: 'int',
        default: 0,
    })
    member_count: number;
    @Column({
        comment: '版主数量',
        type: 'int',
        default: 0,
    })
    moderator_count: number;
    @Column({
        comment: '状态',
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.ACTIVE,
    })
    status: GameStatus;

    @OneToMany(() => CommunityLog, (log) => log.community,{
        eager: true,
    })
    logs: CommunityLog[];
    // 发布的资源
    @OneToMany(() => Resource, (resource) => resource.game)
    published_resources: Resource[];

    // 版主申请
    @OneToMany(() => ModeratorRequest, (request) => request.target_community)
    moderator_requests: ModeratorRequest[];

    @ManyToMany(()=>Category)
    @JoinTable()
    categories: Category[];
}
