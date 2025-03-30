import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigKey } from './common/constants';
import { CaslModule } from './casl/casl.module';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { PermissionModule } from './permission/permission.module';

import { OssUtilService } from './utils/oss-util/oss-util.service';
import { OssUtilModule } from './utils/oss-util/oss-util.module';
import { GameModule } from './game/game.module';
import { TopicModule } from './topic/topic.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get<string>(ConfigKey.DB_HOST),
                port: configService.get<number>(ConfigKey.DB_PORT),
                username: configService.get<string>(ConfigKey.DB_USER),
                password: configService.get<string>(ConfigKey.DB_PASSWORD),
                database: configService.get<string>(ConfigKey.DB_DATABASE),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: configService.get<boolean>(ConfigKey.DB_SYNC),
            }),
            inject: [ConfigService],
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'single',
                url: configService.get<string>(ConfigKey.REDIS_URL),
            }),
            inject: [ConfigService],
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UserModule,
        AuthModule,
        CaslModule,
        PermissionModule,
        OssUtilModule,
        GameModule,
        TopicModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
