import { Injectable } from '@nestjs/common';
import { CreateUserContentDto } from './dto/create-user_content.dto';
import { UpdateUserContentDto } from './dto/update-user_content.dto';
import { OssUtilService } from 'src/utils/oss-util/oss-util.service';
import { randomUUID } from 'crypto';
import { MessageConstant } from 'src/common/constants';
import { Result } from 'src/common/result/Result';
import { DataSource, EntityManager } from 'typeorm';
import { UserContent } from 'src/common/entity/user_content.entity';
import { Game } from 'src/common/entity/game.entity';
import { Topic } from 'src/common/entity/topic.entity';

@Injectable()
export class UserContentService {
    private readonly manager: EntityManager;
    constructor(
        private ossUtilService: OssUtilService,
        private dataSource: DataSource,
    ) {
        this.manager = this.dataSource.manager;
    }
    // 上传用户内容图片
    async uploadCover(file: Express.Multer.File) {
        const fileName = randomUUID() + '.' + file.mimetype.split('/')[1];
        const ossUrl = await this.ossUtilService.uploadUserContentCover(
            file,
            fileName,
        );
        return Result.success(MessageConstant.SUCCESS, ossUrl);
    }
    // 保存用户内容
    async savePostContent(
        user_id: string,
        createUserContentDto: CreateUserContentDto,
    ) {
        const userContent = this.manager.create(UserContent, {
            ...createUserContentDto,
            user_id,
        });
        // 保持内容
        const savedUserContent = await this.manager.save(userContent);
        // 增加热度
        if (userContent.game_ids.length > 0) {
            userContent.game_ids.forEach(async (id) => {
                await this.manager.increment(Game, id, 'hot_point', 1);
            });
        }
        // 增加热度
        if (userContent.topic_ids.length > 0) {
            userContent.topic_ids.forEach(async (id) => {
                await this.manager.increment(Topic, id, 'hot_point', 1);
                const count = await this.manager.count(UserContent,{
                    where:{
                        
                    }
                })
            });

        }
        return Result.success(MessageConstant.SUCCESS, null);
    }


    async uploadPicture(file: Express.Multer.File) {
        const fileName = randomUUID() + '.' + file.mimetype.split('/')[1];
        const ossUrl = await this.ossUtilService.uploadUserContentPicture(
            file,
            fileName,
        );
        return Result.success(MessageConstant.SUCCESS, {url:ossUrl});
    }
}
