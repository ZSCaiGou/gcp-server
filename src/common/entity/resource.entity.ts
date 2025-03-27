import { Column, Entity, PrimaryColumn } from 'typeorm';
/**
 * ResourceStatus enum
 * @enum
 * @property {string} PENDING - 审核中
 * @property {string} APPROVED - 审核通过
 * @property {string} REJECTED - 审核拒绝
 * @property {string} HIDDEN - 隐藏
 * @property {string} DELETED - 删除
 */
export enum ResourceStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    HIDDEN = 'hidden',
    DELETED = 'deleted',
}
/**
 * ResourceType enum
 * @enum
 * @property {string} IMAGE - 图片
 * @property {string} VIDEO - 视频
 * @property {string} DOCUMENT - 文档
 */
export enum ResourceType {
    IMAGE = 'image',
    VIDEO = 'video',
    DOCUMENT = 'document',
}
@Entity({
    comment: '资源表',
})
export class Resource {
    @PrimaryColumn({
        type: 'bigint',
        generated: true,
    })
    id: bigint;
    
    @Column({
        type: 'varchar',
        length:36
    })
    user_id: string;

    @Column({
        type: 'bigint',
        comment:'资源所属游戏'
    })
    game_id: number;

    @Column({
        type: 'varchar',
        length: 255,
        comment:'资源路径'
    })
    file_url: string;

    @Column({
        type:"enum",
        enum:ResourceType,
        comment:'资源类型'
    })
    file_type: ResourceStatus;

    @Column({
        type:"varchar",
        length:255,
        comment:'版权信息'
    })
    copyright: string;

    @Column({
        type:"enum",
        enum:ResourceStatus,
        comment:'资源状态'
    })
    status:ResourceType;
}
