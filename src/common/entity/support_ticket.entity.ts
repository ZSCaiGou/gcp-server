import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

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

    @ManyToOne(() => User, (user) => user.support_tickets)
    @JoinColumn({ name: 'user_id' })
    user:User

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
