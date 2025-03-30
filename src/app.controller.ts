import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EntityManager, DataSource } from 'typeorm';
import { Role } from './common/entity/role.entity';
import { Permission } from './common/entity/permission.entity';
import { AbilityAction, AbilityResource } from './common/constants';
import { OssUtilService } from './utils/oss-util/oss-util.service';
import { Public } from './common/decorator/public.decorator';

@Controller()
export class AppController {
    private readonly manager: EntityManager;
    constructor(
        private readonly appService: AppService,
        private readonly dataSource: DataSource,
        private readonly ossUtilService: OssUtilService,
    ) {
        this.manager = this.dataSource.manager;
    }

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

}
