import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum TargetType {
    TOPIC = 'topic',
    COMMENT = 'comment',
    CONTENT = 'content',
    GAME = 'game',
}
/**
 *  互动类型
 *  @enum {string} InteractionType
 *  @property {string} LIKE - 点赞
 *  @property {string} DISLIKE - 踩
 *  @property {string} SHARE - 分享
 *  @property {string} COLLECT - 收藏
 *  @property {string} FOLLOW - 关注
 *  @property {string} JOIN - 加入
 */
export enum InteractionType {
    LIKE = 'like',
    DISLIKE = 'dislike',
    SHARE = 'share',
    COLLECT = 'collect',
    FOLLOW = 'follow',
    JOIN='join',
}

@Entity({
    comment: '互动记录',
})
export class Interaction {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
    })
    id: bigint;



    @ManyToOne(() => User, (user) => user.user_interactions)
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column({
        type: 'enum',
        enum: TargetType,
        comment: '目标类型',
    })
    target_type: TargetType;

    @Column({
        type: 'bigint',
        comment: '目标id',
        nullable: true,
    })
    target_id: bigint;

    @Column({
        type:"varchar",
        length: 36,
        comment: '目标用户id',
        nullable: true,
        default: null,
    })
    target_user_id: string;

    @Column({
        type: 'enum',
        enum: InteractionType,
        comment: '互动类型',
    })
    type: string;

    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}
