import { DataSource, EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AbilityAction, AbilityResource } from 'src/common/constants';
import { User } from 'src/common/entity/user.entity';
import { Permission } from 'src/common/entity/permission.entity';
import { UserContentType } from 'src/common/entity/user_content.entity';

@Injectable()
export class PermissionService {
  private readonly manager: EntityManager;
  constructor(private readonly DataSource: DataSource){
    this.manager = this.DataSource.manager;
  }
  async create () {
    
    const permission = this.manager.create(Permission,{
      action:AbilityAction.READ,
      subject:AbilityResource.UserContent,
      condition:{
        type: UserContentType.POST
      }
    })
    await this.manager.save(permission)
  }
}
