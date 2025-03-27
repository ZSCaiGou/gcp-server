import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * 用户内容类型枚举
 * @enum {string}
 * @property {string} GUIDE 攻略
 * @property {string} RESOURCE 资源
 * @property {string} NEWS 新闻资讯
 * @property {string} POST 帖子
 *
 */
export enum UserContentType {
    GUIDE = 'guide',
    RESOURCE = 'resource',
    NEWS = 'news',
    POST = 'post',
}
/**
 * 评论状态枚举
 * @enum {string}
 * @property {string} PENDING 待审核
 * @property {string} APPROVED 审核通过
 * @property {string} REJECTED 审核拒绝
 * @property {string} HIDDEN 隐藏
 * @property {string} DELETED 已删除
 */
export enum ContentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    HIDDEN = 'hidden',
    DELETED = 'deleted',
}
@Entity({
    comment: '用户内容',
})
export class UserContent {
    @PrimaryColumn({
        comment: 'ID',
        type: 'bigint',
        generated: true,
    })
    id: bigint;
    @Column({
        comment: '用户ID',
        type: 'varchar',
        length: 32,
    })
    user_id: string;
    @Column({
        comment: '游戏ID',
        type: 'int',
    })
    game_id: number;
    @Column({
        comment: '用户内容类型',
        type: 'enum',
        enum: UserContentType,
    })
    type: UserContentType;
    @Column({
        comment: '用户内容标题',
        type: 'varchar',
        length: 128,
    })
    title: string;
    @Column({
        comment: '用户内容内容',
        type: 'text',
    })
    content: string;

    @Column({
        comment: '用户内容封面',
        type: 'json',
    })
    cover_url: string[];
    @Column({
        comment: '用户内容状态',
        type: 'enum',
        enum: ContentStatus,
        default: ContentStatus.PENDING,
    })
    status: ContentStatus;
    @Column({
        comment: '创建时间',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    create_time: Date;
    @Column({
        comment: '更新时间',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    update_time: Date;
}
