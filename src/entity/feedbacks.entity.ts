import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * FeedbackStatus
 * @enum
 * @property PENDING - 待处理
 * @property RESOLVED - 已处理
 * @property CLOSED - 已关闭
 */
export enum FeedbackStatus {
    PENDING = 'pending',
    RESOLVED ='resolved',
    CLOSED = 'closed',
}

@Entity({
    comment: '反馈表',
})
export class Feedbacks {
    @PrimaryColumn({
        type:'bigint',
        generated: true,
    })
    id: bigint;
    @Column({
        type:'varchar',
        length:36,
    })
    user_id:string;
    @Column({
        type:'text',
    })
    content: string;
    @Column({
        type:'enum',
        enum: FeedbackStatus,
        default: FeedbackStatus.PENDING,
    })
    status: FeedbackStatus;
    @Column({
        type:'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}