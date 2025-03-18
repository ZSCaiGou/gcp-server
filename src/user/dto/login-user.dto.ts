
export enum LoginType {
    EMAIL = 'email',
    PHONE = 'phone',
    USERNAME = 'username'
}

export class LoginUserDto {
    type: LoginType;
    account: string;
    password: string;
}