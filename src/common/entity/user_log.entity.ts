import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({
    comment: '用户操作日志',
})
export class UserLog {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
    })
    id: bigint;

    @ManyToOne(() => User, (user) => user.logs, {})
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'varchar', length: 36, comment: '操作对象ID' })
    target_id: string;

    @Column({ type: 'varchar', length: 255, comment: '操作内容' })
    content: string;

    @Column({ type: 'varchar', length: 255, comment: '操作类型' })
    type: string;

    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}
