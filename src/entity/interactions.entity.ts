import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

export enum TargetType {
    TOPIC = 'topic',
    COMMENT = 'comment',
    CONTENT = 'content',
}
/**
 *  互动类型
 *  @enum {string} InteractionType
 *  @property {string} LIKE - 点赞
 *  @property {string} DISLIKE - 踩
 *  @property {string} SHARE - 分享
 *  @property {string} COLLECT - 收藏
 */
export enum InteractionType {
    LIKE = 'like',
    DISLIKE = 'dislike',
    SHARE = 'share',
    COLLECT = 'collect',
}

@Entity({
    comment: '互动记录',
})
export class Interactions {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
    })
    id: bigint;

    @Column({
        type: 'varchar',
        length: 32,
    })
    user_id: number;

    @Column({
        type: 'enum',
        enum: TargetType,
        comment: '目标类型',
    })
    target_type: TargetType;
    @Column({
        type: 'bigint',
        comment: '目标id',
    })
    target_id: bigint;
    @Column({
        type: 'enum',
        enum: InteractionType,
        comment: '互动类型',
    })
    type: string;
    @Column()
    created_at: Date;
}
