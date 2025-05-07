import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({
    comment: '话题表',
})
export class Topic {
    @PrimaryColumn({
        type: 'bigint',
    })
    @Generated()
    id: bigint;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '话题标题',
    })
    title: string;

    @ManyToOne(() => User, (user) => user.created_topics)
    @JoinColumn({ name: 'user_id' })
    user:User;

    @Column({
        type: 'int',
        comment: '话题热度',
        default: 0,
    })
    hot_point: number;

    @Column({
        type: 'int',
        comment: '话题参与人数',
        default: 0,
    })
    join_count: number;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;
}
