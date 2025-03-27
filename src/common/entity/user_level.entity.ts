import {
    AfterUpdate,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryColumn,
} from 'typeorm';
import { Badge } from './badge.entity';

@Entity({
    comment: '用户等级表',
})
export class UserLevel {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
        comment: '用户等级id',
    })
    id: bigint;

    @Column({
        type: 'int',
        default: 0,
        comment: '用户的积分',
    })
    points: number;

    @Column({
        type: 'int',
        default: 1,
        comment: '用户的等级',
    })
    level: number;

    @Column({
        type: 'int',
        default: 0,
        comment: '用户的经验',
    })
    ex: number;

    @ManyToMany(() => Badge, {
        eager: true,
    })
    @JoinTable()
    badges: Badge[];

    @AfterUpdate()
    async updateLevel() {
        // 等级计算规则

        if (this.level < 10) {
            // 10级以下每100经验升一级
            if (this.ex >= 100) {
                this.level = this.level + 1;
                this.ex -= 100;
            }
        }

        if (this.level >= 10 && this.level < 20) {
            // 10级以上每500经验升一级
            if (this.ex >= 500) {
                this.level = this.level + 1;
                this.ex -= 500;
            }
        }

        if (this.level >= 20 && this.level < 30) {
            // 20级以上每1000经验升一级
            if (this.ex >= 1000) {
                this.level = this.level + 1;
                this.ex -= 1000;
            }
        }
        if (this.level >= 30) {
            // 30级以上每2000经验升一级
            if (this.ex >= 2000) {
                this.level = this.level + 1;
                this.ex -= 2000;
            }
        }
    }
}
