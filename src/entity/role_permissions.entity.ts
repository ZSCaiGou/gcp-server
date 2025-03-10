
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity({
  comment: '角色权限关系表',
})
export class RolePermissions {

  @PrimaryColumn()
  role_id: number;

  @PrimaryColumn()
  permission_id: number;
}