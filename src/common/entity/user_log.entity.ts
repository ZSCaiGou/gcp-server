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

export enum UserLogType {
    LOGIN = 'login',
    VISIT = 'visit',
    ACTIVE = 'active',
}
@Entity({
    comment: '用户操作日志',
})
export class UserLog {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
    })
    id: bigint;

    @ManyToOne(() => User, (user) => user.logs)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'varchar',
        length: 36,
        comment: '操作对象ID',
        default: null,
    })
    target_id: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '操作内容',
        default: null,
    })
    content: string;

    @Column({
        type: 'enum',
        enum: UserLogType,
        comment: '操作类型',
    })
    type: UserLogType;

    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}
