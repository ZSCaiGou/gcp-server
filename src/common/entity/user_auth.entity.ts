
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    comment: '用户认证信息',
})
export class UserAuth {
    @PrimaryGeneratedColumn({
        comment: '主键',
    })
    id: number;

    @Column({
        type: 'varchar',
        length: 36,
        comment: '用户ID',
    })
    user_id: string;
    @Column({
        type: 'varchar',
        length: 36,
        comment: '认证类型',
    })
    auth_type: string;
    @Column({
        type: 'varchar',
        length: 255,
        comment: '认证令牌',
    })
    auth_token: string;
}