import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';

import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { ConfigKey } from 'src/common/constants';

import { SmtpModule } from 'src/utils/smtp/smtp.module';

@Module({
    imports: [
        forwardRef(() => UserModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory:(configService: ConfigService) => ({
                secret: configService.get(ConfigKey.JWT_SECRET),
                signOptions: {
                    expiresIn:Math.floor(Date.now() / 1000)+ configService.get(ConfigKey.JWT_EXPIRE_TIME),
                },
                global: true,
            }),
            inject: [ConfigService],
        }),
        SmtpModule
    ],
    providers: [
        AuthService,
        {
            provide: 'APP_GUARD',
            useClass: AuthGuard,
        },
    ],
    exports: [AuthService],
})
export class AuthModule {}
