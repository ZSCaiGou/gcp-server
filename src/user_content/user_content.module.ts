import { Module } from '@nestjs/common';
import { UserContentService } from './user_content.service';
import { UserContentController } from './user_content.controller';
import { OssUtilModule } from 'src/utils/oss-util/oss-util.module';

@Module({
  controllers: [UserContentController],
  providers: [UserContentService],
  imports: [OssUtilModule],
  exports: [UserContentService],
})
export class UserContentModule {}
