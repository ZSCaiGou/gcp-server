
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, PrimaryColumn } from 'typeorm';


/**
 * TaskStatus
 * @enum
 * @property ACTIVE - 活动进行中
 * @property INACTIVE - 活动未开始
 * @property COMPLETED - 活动已结束
 */
export enum TaskStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    COMPLETED = 'completed',
}

@Entity({
    comment:'任务奖励'
})
export class TaskReward {

    @PrimaryColumn({
        type: "bigint",
        generated: true,
    })
    id:bigint;

    @Column({
        type: "varchar",
        length: 255,
    })
    title:string;

    @Column({
        type:'text',
        comment:'活动描述'
    })
    content:string;
    @Column({
        type: "int",
        comment:'奖励积分'
    })
    reward_points:number;
    @Column({
        type: "enum",
        enum: TaskStatus,
        comment:'活动状态',
        default: TaskStatus.INACTIVE,
    })
    status:TaskStatus;
}