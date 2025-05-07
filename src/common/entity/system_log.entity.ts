import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({
    comment: '系统日志',
})
export class SystemLog {
    @PrimaryGeneratedColumn({
        type: 'bigint',
        comment: '日志ID',
    })
    id: bigint;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '日志内容',
    })
    content: string;
    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}
