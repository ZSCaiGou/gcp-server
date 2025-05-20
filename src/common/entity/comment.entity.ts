import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { UserContent } from './user_content.entity';

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
        type: 'bigint',
        comment: '父评论ID',
    })
    parent_id: bigint;

    @Column({
        type: 'bigint',
        comment: '原始评论ID',
        default: -1
    })
    origin_id: bigint;

    @Column({
        type: 'enum',
        enum: CommentStatus,
        default: CommentStatus.NORMAL,
        comment: '评论状态',
    })
    status: CommentStatus;

    @Column({
        type: 'bigint',
        comment: '目标内容ID',
    })
    target_content_id: bigint;
    
    @ManyToOne(() => UserContent, (content) => content.comments)
    @JoinColumn({ name: 'target_content_id' })
    target_content:UserContent

    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @Column({
        type: 'timestamp',
        comment: '更新时间',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;
    
    @Column({
        type: 'int',
        comment: '点赞数',
        default: 0,
    })
    like_count: number;
    @Column({
        type: 'int',
        comment: '回复数',
        default: 0,
    })
    reply_count: number;

    @Column({
        type:"json",
        comment:"用户信息",
        default:null
    })
    user_info: {
        id: string;
        nickname: string;
        avatar_url: string;
        level: number;
    }
    @ManyToOne(() => User, (user) => user.user_comments)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
