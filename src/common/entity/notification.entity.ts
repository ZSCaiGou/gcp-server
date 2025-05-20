import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
    SYSTEM = 'system',
    MESSAGE = 'message',
    EVENT = 'event',
}

@Entity({
    comment: '通知表',
})
export class Notification {
    @PrimaryColumn({
        comment: '主键',
        generated: true,
        type: 'bigint',
    })
    id: bigint;

    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        comment: '通知类型',
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({
        comment: '通知内容',
        type: 'text',
    })
    content: string;

    @Column({
        comment: '是否已读',
        type: 'boolean',
        default: false,
    })
    is_read: boolean;

    @Column({
        comment: '创建时间',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}
