import { Module } from '@nestjs/common';
import { UserContentService } from './user_content.service';
import { UserContentController } from './user_content.controller';
import { OssUtilModule } from 'src/utils/oss-util/oss-util.module';
import { RecommandModule } from 'src/utils/recommand/recommand.module';

@Module({
    controllers: [UserContentController],
    providers: [UserContentService],
    imports: [OssUtilModule, RecommandModule],
    exports: [UserContentService],
})
export class UserContentModule {}
