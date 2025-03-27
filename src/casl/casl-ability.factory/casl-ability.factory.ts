import {
    AbilityBuilder,
    createMongoAbility,
    InferSubjects,
    MongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { AbilityAction, AbilityResource } from 'src/common/constants';
import { User } from 'src/common/entity/user.entity';
import { ResourceMap } from 'src/common/interface';

type Subjects =  keyof typeof AbilityResource | ResourceMap[ keyof typeof AbilityResource];

export type AppAbility = MongoAbility<[AbilityAction, Subjects]>;
@Injectable()
export class CaslAbilityFactory {
    // 生成用户的Ability对象
    async createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
        // 获取用户的所有权限
        const allPermissions = [
            ...user.roles.flatMap((role) => role.permissions),
            ...user?.permissions,
        ];

        // 遍历所有权限，生成AbilityBuilder规则
        allPermissions.forEach((permission) => {
            // 如果权限有对应的条件，则生成条件规则
            if (permission.condition) {
                can(
                    permission.action,
                    permission.subject,
                    permission.condition,
                );
            } else {
                can(permission.action, permission.subject);
            }
        });
        return build();
    }
    // 生成访客的Ability对象
    async createForVisitor() {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
        can(AbilityAction.READ, 'ALL');
        return build();
    }
}
