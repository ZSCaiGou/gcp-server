import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * 客服工单
 * @enum
 *
 */
export enum SupportTicketStatus {
    PENDING = 'pending',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

@Entity({
    comment: '客服工单',
})
export class SupportTicket {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
    })
    id: bigint;
    @Column({
        type: 'varchar',
        length: 36,
    })
    user_id: string;
    @Column({
        type: 'text',
        comment: '用户问题',
    })
    question: string;
    @Column({
        type: 'text',
        comment: '客服回复',
    })
    response: string;
    @Column({
        type: 'enum',
        enum: SupportTicketStatus,
        default: SupportTicketStatus.PENDING,
    })
    status: SupportTicketStatus;
    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}
