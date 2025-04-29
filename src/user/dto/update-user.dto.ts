import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from 'src/common/entity/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    username: string;
    email: string;
    role: "ADMIN" | "MODERATOR" | "USER";
    status: UserStatus.ACTIVE | UserStatus.DISABLED;
    managed_communities: {
        id:bigint;
        title:string;
        key:string;
    }[];
}
