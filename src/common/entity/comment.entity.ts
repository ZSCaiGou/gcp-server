import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

export enum CommentType {
    USERCONTENT = 'usercontent',
    TOPIC = 'topic',
}

export enum CommentStatus {
    NORMAL = 'normal',
    DELETED = 'deleted',
    HIDDEN = 'hidden',
}

@Entity({
    comment: '评论表',
})
export class Comment {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
        comment: '评论ID',
    })
    id: bigint;

    @Column({
        type: 'text',
        comment: '评论内容',
    })
    content: string;

    @Column({
        type: 'varchar',
        comment: '用户ID',
        length: 32,
    })
    user_id: string;

    @Column({
        type: 'bigint',
        comment: '父评论ID',
    })
    parent_id: number;

    @Column({
        type: 'enum',
        enum: CommentStatus,
        default: CommentStatus.NORMAL,
        comment: '评论状态',
    })
    status: CommentStatus;

    @Column({
        type: 'enum',
        enum: CommentType,
        comment: '评论类型',
    })
    type: CommentType;

    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        comment: '更新时间',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
