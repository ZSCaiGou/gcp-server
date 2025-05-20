import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { OssUtilModule } from 'src/utils/oss-util/oss-util.module';

@Module({
    controllers: [ResourceController],
    providers: [ResourceService],
    imports: [OssUtilModule],
})
export class ResourceModule {}
