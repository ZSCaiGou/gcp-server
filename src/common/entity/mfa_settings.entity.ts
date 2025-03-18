import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
    comment: '多重身份验证设置',
})
export class MfaSettings {
    @PrimaryColumn({
        comment: '用户ID',
        type: 'varchar',
        length: 36,
    })
    user_id: string;
    @Column({
        comment: '多重身份验证类型',
        type: 'varchar',
        length: 20,
    })
    maf_type: string;
    @Column({
        comment: '密钥',
        type: 'varchar',
        length: 255,
    })
    secret_key: string;
    @Column({
        comment: '是否启用',
        type: 'boolean',
        default: false,
    })
    is_enabled: boolean;
}
