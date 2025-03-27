import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from './permission.entity';

@Entity({
    comment: '角色表',
})
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 50,
        unique: true,
        comment: '角色名称',
    })
    role_name: string;

    @ManyToMany(() => Permission,{eager:true})
    @JoinTable()
    permissions: Permission[];
}
