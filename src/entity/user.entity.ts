import { Column, Entity, Generated, PrimaryColumn } from 'typeorm';

export enum UserStatus {
    ACTIVE = 'active',
    DISABLED = 'disabled',
    DELETED = 'deleted',
}

@Entity({
    comment: '用户表',
})
export class User {
    @PrimaryColumn({
        comment: '用户ID',
    })
    @Generated('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
        nullable: false,
        comment: '用户名',
    })
    username: string;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
        comment: '邮箱',
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 50,
        comment: '手机号',
    })
    phone: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '密码',
        nullable: false,
    })
    password: string;

    @Column({
        type: 'timestamp',
        comment: '创建时间',
        default: () => 'CURRENT_TIMESTAMP',
    })
    create_time: Date;

    @Column({
        type: 'timestamp',
        comment: '更新时间',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    update_time: Date;

    @Column({
        type: 'timestamp',
        comment: '最后登录时间',
    })
    last_login_time: Date;
    @Column({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
        comment: '用户状态',
    })
    status:UserStatus ;
}
