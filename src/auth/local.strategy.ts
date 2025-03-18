import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginType, LoginUserDto } from 'src/user/dto/login-user.dto';
import { User } from 'src/common/entity/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(LocalStrategy.name);
    constructor(private readonly authService: AuthService) {
        super({
            // usernameField: 'account',
            // passwordField: 'password',
        });
    }

    async validate(
        username: { type: LoginType; value: string },
        password: string,
    ): Promise<any> {
        // this.logger.log(`username: ${username}, password: ${password}`);
        // const loginUserDto = new LoginUserDto();
        // loginUserDto.account = username;
        // loginUserDto.password = password;
        // const user = await this.authService.validateUser(loginUserDto);

        // if (!user) {
        //     throw new UnauthorizedException();
        // }
        // return user as User;
    }
}
