import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

@Entity({
    comment: '用户浏览历史',
})
export class UserViewHistory {
    @PrimaryColumn()
    @Generated()
    id: number;

    @Column({
        type: 'varchar',
        length: 36,
        comment: '用户id',
    })
    user_id: string;

    @Column({
        comment: '浏览内容id',
        type: 'bigint',
    })
    user_content_id: bigint;

    @Column({
        type: 'json',
        comment: '游戏id',
        default: null,
    })

    game_ids: string[];
    @Column({
        type: 'json',
        comment: '话题id',
        default: null,
    })
    topic_ids: string[];

    @Column({
        type: 'timestamp',
        comment: '浏览时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    view_time: Date;
}
