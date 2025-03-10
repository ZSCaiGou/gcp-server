import { Entity, PrimaryColumn } from "typeorm";

@Entity({
    comment: "用户角色关系表"
})
export class UserRoles {

    @PrimaryColumn({
        type: "varchar",
        length: 36,
        comment: "用户ID"
    })
    user_id: string;

    @PrimaryColumn({
        type: "int",
        comment: "角色ID"
    })
    role_id: number;
}