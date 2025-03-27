import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {

    @IsString()
    @ApiProperty()
    username?: string;

    @IsEmail()
    @ApiProperty()
    email?: string;

    @IsString()
    @ApiProperty()
    phone?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    password?: string;
}
