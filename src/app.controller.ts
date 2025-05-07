import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { EntityManager, DataSource } from 'typeorm';
import { Role } from './common/entity/role.entity';
import { AbilityAction, AbilityResource } from './common/constants';
import { OssUtilService } from './utils/oss-util/oss-util.service';
import { Public } from './common/decorator/public.decorator';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Controller()
export class AppController {
    private readonly manager: EntityManager;
    constructor(
        private readonly appService: AppService,
        private readonly dataSource: DataSource,
        private readonly ossUtilService: OssUtilService,
        @InjectRedis() private readonly redisClient: Redis,
    ) {
        this.manager = this.dataSource.manager;
        
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
    @Public()
    @Get('code/:phone')
    async test(@Param('phone') phone: string) {
        return this.redisClient.get(phone);
    }
}
