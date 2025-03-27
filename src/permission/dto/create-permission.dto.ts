import { AbilityAction, AbilityResource } from 'src/common/constants';
import { ResourceMap } from 'src/common/interface';

export class CreatePermissionDto<T = string> {
    action: AbilityAction;

    subject: AbilityResource;

    condition: Record<keyof T, any | keyof T>;
}
