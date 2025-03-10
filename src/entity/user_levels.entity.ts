import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    comment:'用户等级表'
})
export class UserLevels {
    @PrimaryColumn({
        type: 'varchar',
        length:36
    })
    user_id: string;
    
    @Column({
        type: 'int',
        default: 0,
        comment:'用户的积分'
    })
    points: number;

    @Column({
        type: 'int',
        default: 1,
        comment:'用户的等级'
    })
    level: number;

    @Column({
        type:'json',
        comment:'用户的徽章'
    })
    badges: string[];
}
