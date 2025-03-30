import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    comment: '游戏(社区)信息',
})
export class Game {
    @PrimaryColumn({
        comment: '游戏ID',
        type: 'bigint',
        generated: true,
    })
    id: bigint;
    @PrimaryColumn({
        comment: '游戏名称',
        type: 'varchar',
        length: 255,
    })
    title: string;
    @Column({
        comment: '游戏描述',
        type: 'text',
        default: null,
    })
    description: string;

    @Column({
        comment: '游戏分类',
        type: 'json',
        default: null,
    })
    category: string[];

    @Column({
        comment: '游戏热度',
        type: 'int',
        default: 0,
    })
    hot_point: number;

    @Column({
        comment: '游戏标签',
        type: 'json',
        default: null,
    })
    tags: JSON;

    @Column({
        comment: '游戏封面',
        type: 'varchar',
    })
    game_img_url: string;
}
