import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum PrivacyLevel {
    PUBLIC = 'public',
    PRIVATE = 'private',
    friends = 'friends',
}
@Entity({
    comment: '用户资料',
})
export class UserProfiles {
    @PrimaryColumn({
        type: 'char',
        length: 36,
        comment: '用户',
    })
    user_id: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '头像地址',
    })
    avatar_url: string;

    @Column({
        type: 'varchar',
        length: 255,
        comment: '昵称',
    })
    nickname: string;
    @Column({
        type: 'text',
        comment: '个人简介',
    })
    bio: string;
    @Column({
        type: 'enum',
        enum: PrivacyLevel,
        default: PrivacyLevel.PUBLIC,
        comment: '隐私等级',
    })
    privacy_level: PrivacyLevel;
}
