import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    PrimaryColumn,
} from 'typeorm';

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

    @Column({
        type: 'varchar',
        length: 36,
        comment: '话题作者ID',
    })
    user_id: string;

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
