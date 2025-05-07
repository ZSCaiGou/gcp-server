import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';

@Entity({
    comment:"社区日志"
})
export class CommunityLog {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
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

    @ManyToOne(() => Game, (game) => game.logs)
    @JoinColumn({ name: 'game_id' })
    community: Game;
}
