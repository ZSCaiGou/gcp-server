
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { AbilityAction, AbilityResource } from '../constants';
import { ResourceMap } from '../interface';

@Entity({
    comment: '权限表',
})
export class Permission {

    @PrimaryColumn({
        type: 'bigint',
        comment: '权限ID',
        generated: 'increment',
    })
    id: number;

    @Column({
        comment: '权限名称',
        type: 'enum',
        enum: AbilityAction,
    })
    action: AbilityAction;

    @Column({
        comment: '权限对象',
        type: 'enum',
        enum: AbilityResource,
    })
    subject: AbilityResource;

    @Column({
        comment: '权限条件',
        type: 'json',
        default: null,
    })
    condition?: Record<ResourceMap[this['subject']], any | ResourceMap[this['subject']]>;
}
