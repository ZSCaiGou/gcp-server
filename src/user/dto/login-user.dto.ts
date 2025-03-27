import { ApiProperty } from '@nestjs/swagger';
import { isEmpty, IsNotEmpty, IsString } from 'class-validator';

export enum LoginType {
    EMAIL = 'email',
    PHONE = 'phone',
    USERNAME = 'username',
}

export class LoginUserDto {
    @IsNotEmpty()
    @ApiProperty({type: String, enum: LoginType, example: LoginType.USERNAME})
    type: LoginType;

    @IsNotEmpty()
    @ApiProperty()
    account: string;

    @IsNotEmpty()
    @ApiProperty()
    password: string;
}
