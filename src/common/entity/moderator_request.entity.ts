import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Game } from './game.entity';

export enum ModeratorRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity()
export class ModeratorRequest {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({
        type: 'varchar',
        length: 36,
        default:"", // 默认值为空字符串
    })
    message: string; // 申请理由
    @Column({
        type: 'enum',
        enum: ModeratorRequestStatus,
        default: ModeratorRequestStatus.PENDING, // 默认状态为 PENDING
        comment: '申请状态',
    })
    status: ModeratorRequestStatus; // 申请状态
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date; // 最后更新时间

    @Column({ type: 'bigint', comment: '目标社区ID' })
    target_community_id: bigint; // 修正拼写错误
    
    @ManyToOne(() => Game, (game) => game.moderator_requests)
    @JoinColumn({ name: 'target_community_id' })
    target_community: Game;

    @ManyToOne(() => User, (user) => user.moderator_requests,{
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
