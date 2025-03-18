import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity(
    {
        comment: "权限表",
    }
)
export class Permissions {
    
    @PrimaryColumn({
        type:'bigint',
        comment: '权限ID',
        generated: 'increment'
    })
    id: number;

    @Column({
        comment: "权限名称",
        type: "varchar",
        length: 50,
    })
    perm_name: string;
}
