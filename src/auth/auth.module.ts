import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';

import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Module({
    imports: [
        forwardRef(() => UserModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: '168h' },
                global: true,
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, LocalStrategy,
    {
        provide:'APP_GUARD',
        useClass:AuthGuard
    }],
    exports: [AuthService],
})
export class AuthModule {}
