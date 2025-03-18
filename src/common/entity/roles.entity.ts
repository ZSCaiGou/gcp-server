import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity ({
    comment: "角色表"
})
export class Roles {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(
        {
            type: "varchar",
            length: 50,
            unique: true,
            comment: "角色名称"
        }
    )   
    role_name: string;
}