import { DataSource, EntityManager } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { User } from 'src/common/entity/user.entity';
import { OssUtilService } from 'src/utils/oss-util/oss-util.service';
import {
    Resource,
    ResourceStatus,
    ResourceType,
} from 'src/common/entity/resource.entity';
import { Game } from 'src/common/entity/game.entity';

@Injectable()
export class ResourceService {
    private readonly manager: EntityManager;
    constructor(
        private readonly dataSource: DataSource,
        private readonly ossUtil: OssUtilService,
    ) {
        this.manager = this.dataSource.manager;
    }
    // 上传资源
    async uploadResource(
        file: Express.Multer.File,
        createResourceDto: CreateResourceDto,
        userId: string,
    ) {
        const user = await this.manager.findOneBy(User, { id: userId });
        if (!user) {
            return Result.error(
                MessageConstant.USER_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        const game = await this.manager.findOneBy(Game, {
            id: createResourceDto.gameId,
        });
        if (!game) {
            return Result.error(
                MessageConstant.GAME_NOT_EXIST,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        // 资源名称不能重复
        const existResource = await this.manager.findOneBy(Resource, {
            file_name: createResourceDto.name,
            file_version: createResourceDto.version,
            game: {
                id: game.id,
            },
        });
        if (existResource) {
            return Result.error(
                MessageConstant.RESOURCE_NAME_EXIST,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }
        // 创建资源
        const resource = this.manager.create(Resource, {
            user,
            game,
        });
        let fileName = createResourceDto.name + '-' + createResourceDto.version;

        // 文件的类型只能是压缩文件
        if (file.mimetype.indexOf('compressed') === -1) {
            return Result.error(
                MessageConstant.RESOURCE_TYPE_ERROR,
                HttpStatus.BAD_REQUEST,
                null,
            );
        }

        // 获取文件的后缀名
        const fileExt = file.originalname.split('.').pop();
        fileName += '.' + fileExt;

        // 上传到OSS
        const url = await this.ossUtil.uploadGameResource(
            file,
            fileName,
            game.title,
        );
        resource.file_url = url;

        // 资源类型
        if (createResourceDto.type === ResourceType.PATCH) {
            resource.file_type = ResourceType.PATCH;
        }
        if (createResourceDto.type === ResourceType.OFFICIAL) {
            resource.file_type = ResourceType.OFFICIAL;
        }
        // 资源名称
        resource.file_name = createResourceDto.name;
        // 资源大小 单位：MB
        resource.file_size = file.size / 1024 / 1024;
        // 资源版本
        resource.file_version = createResourceDto.version;
        const savedResource = await this.manager.save(resource);
        return Result.success(MessageConstant.SUCCESS, {
            id: savedResource.id,
            name: savedResource.file_name,
            version: savedResource.file_version,
            size: savedResource.file_size,
            type: savedResource.file_type,
            url: savedResource.file_url,
        });
    }
    // 获取资源列表
    async getResources(gameId: bigint) {
        const resources = await this.manager.find(Resource, {
            where: {
                game: {
                    id: gameId,
                },
                status: ResourceStatus.APPROVED,
            },
            relations: ['game'],
        });
        return Result.success(
            MessageConstant.SUCCESS,
            resources.map((resource) => {
                return {
                    id: resource.id,
                    name: resource.file_name,
                    version: resource.file_version,
                    size: resource.file_size,
                    type: resource.file_type,
                    url: resource.file_url,
                };
            }),
        );
    }
}
