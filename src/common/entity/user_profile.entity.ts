import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

export enum PrivacyLevel {
    PUBLIC = 'public',
    PRIVATE = 'private',
    friends = 'friends',
}
export interface Bio{
    // 性别
    sex:string,
    // 生日
    birthday:{
        year:number,
        month:number,
        day:number
    },
    //地址
    address:{
        contry:string,
        city:string,
        district:string,
    },
    // 个性签名
    signature:string,
    
}
@Entity({
    comment: '用户资料',
})
export class UserProfile {
    @PrimaryGeneratedColumn({
        type: 'bigint',
    })
    id: number;

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
        default: '',
    })
    nickname: string;
    @Column({
        type: 'json',
        comment: '个人简介',
        default: null,
    })
    bio: Bio;
    @Column({
        type: 'enum',
        enum: PrivacyLevel,
        default: PrivacyLevel.PUBLIC,
        comment: '隐私等级',
    })
    privacy_level: PrivacyLevel;
}
