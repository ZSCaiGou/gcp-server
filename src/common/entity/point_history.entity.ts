import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity({ comment: '积分变更历史' })
export class PointHistory {
    @PrimaryColumn({
        type: 'bigint',
    })
    @Generated()
    id: bigint;

    @Column({
        type: 'varchar',
        length: 36,
        comment: '用户ID',
    })
    user_id: string;

    @Column({
        type: 'int',
        comment: '变更前积分',
    })
    before_points: number;

    @Column({
        type: 'int',
        comment: '变更后积分',
    })
    after_points: number;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}
