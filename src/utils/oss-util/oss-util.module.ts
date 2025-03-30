import { Module } from '@nestjs/common';
import { OssUtilService } from './oss-util.service';

@Module({
    providers: [OssUtilService],
    exports: [OssUtilService],
})
export class OssUtilModule {}
