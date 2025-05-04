import { ApiProperty } from '@nestjs/swagger';
import { isEmpty, IsNotEmpty, IsString } from 'class-validator';

export enum LoginType {
    VERIFY_CODE = 'verifyCode',
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
