import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigKey } from './common/constants';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';

import { OssUtilService } from './utils/oss-util/oss-util.service';
import { OssUtilModule } from './utils/oss-util/oss-util.module';
import { GameModule } from './game/game.module';
import { TopicModule } from './topic/topic.module';
import { UserContentModule } from './user_content/user_content.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { TasksModule } from './tasks/tasks.module';
import { GreenModule } from './utils/green/green.module';
import { ResourceModule } from './resource/resource.module';
import { MessageModule } from './message/message.module';
import { SearchModule } from './search/search.module';
import { RewardModule } from './reward/reward.module';
import { SupportModule } from './support/support.module';
import { CommunityacitonModule } from './communityaciton/communityaciton.module';
import { CommentModule } from './comment/comment.module';
import { ModeratorModule } from './moderator/moderator.module';
import { SmtpModule } from './utils/smtp/smtp.module';
import { SafeModule } from './safe/safe.module';
import { OpenAIModule } from './utils/openai/openai.module';
import { DataAnalysisModule } from './data_analysis/data_analysis.module';

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
        ScheduleModule.forRoot(),
        UserModule,
        AuthModule,
        OssUtilModule,
        GameModule,
        TopicModule,
        UserContentModule,
        TasksModule,
        GreenModule,
        ResourceModule,
        MessageModule,
        SearchModule,
        RewardModule,
        SupportModule,
        CommunityacitonModule,
        CommentModule,
        ModeratorModule,
        SmtpModule,
        SafeModule,
        OpenAIModule,
        DataAnalysisModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
