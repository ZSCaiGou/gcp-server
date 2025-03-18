import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum NotificationType {
    SYSTEM = 'system',
    MESSAGE = 'message',
    EVENT = 'event',
}

@Entity({
    comment: '通知表',
})
export class Notifications {
    @PrimaryColumn({
        comment: '主键',
        generated: true,
        type: 'bigint',
    })
    id: bigint;
    
    @Column({
        comment: '用户id',
        type: 'char',
        length: 32,
    })
    user_id: number;

    @Column({
        comment: '通知类型',
        type: 'enum',
        enum: NotificationType,
    })
    tyep: NotificationType;

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
