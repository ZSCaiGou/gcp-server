import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    comment: '话题表',
})
export class Topic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '话题标题',
    })
    title: string;

    @Column({
        type: 'varchar',
        length: 32,
        comment: '话题作者ID',
    })
    user_id: string;

    @Column({
        type: 'text',
        comment: '话题内容',
    })
    content: string;

    @Column({
        type: 'json',
        comment: '话题相关游戏ID列表',
    })
    game_ids: string[];
    
    @Column({
        type:"timestamp",
        default: () => "CURRENT_TIMESTAMP",
    })
    created_at: Date;

    @Column({
        type:"timestamp",
        default: () => "CURRENT_TIMESTAMP",
        onUpdate: "CURRENT_TIMESTAMP",
    })
    updated_at: Date;
}
