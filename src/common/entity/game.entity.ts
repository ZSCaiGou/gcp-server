import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    comment: '游戏信息',
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
    })
    description: string;

    @Column({
        comment: '游戏分类',
        type: 'json',
    })
    category: string[];
    @Column({
        comment: '游戏标签',
        type: 'json',
    })
    tags: JSON;
}
