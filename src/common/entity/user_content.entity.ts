import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Game } from './game.entity';
import { Topic } from './topic.entity';

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
    DRAFT = 'draft',
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
        length: 36,
    })
    user_id: string;

    @Column({
        comment: '游戏ID',
        type: 'json',
        default: null,
    })
    game_ids: string[];

    @Column({
        comment: '话题ID',
        type: 'json',
        default: null,
    })
    topic_ids: string[];

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
        type: 'varchar',
        length: 256,
        default: null,
    })
    cover_url: string;

    @Column({
        comment: '用户内容图片',
        type: 'json',
        default: null,
    })
    picture_urls: string[];

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


    @Column({
        comment: '审核结果',
        type: 'text',
        default: null,
    })
    check_result: string;

    @Column({
        comment: '点赞数',
        type: "int",
        default: 0,
    })
    like_count:number;
    @Column({
        comment: '收藏数',
        type: "int",
        default: 0,
    })
    collect_count:number;
    @Column({
        comment: '评论数',
        type: "int",
        default: 0,
    })
    comment_count:number;
}
