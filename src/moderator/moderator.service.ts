import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateModeratorDto } from './dto/create-moderator.dto';
import { UpdateModeratorDto } from './dto/update-moderator.dto';
import { EntityManager, DataSource, In, Like } from 'typeorm';
import { User } from 'src/common/entity/user.entity';
import { Result } from 'src/common/result/Result';
import { MessageConstant } from 'src/common/constants';
import { ModPaginationCommunityContentDto } from './dto/mod-pagination-community-content.dto';
import {
    ContentStatus,
    UserContent,
} from 'src/common/entity/user_content.entity';

@Injectable()
export class ModeratorService {
    private readonly manager: EntityManager;
    constructor(private dataSource: DataSource) {
        this.manager = this.dataSource.createEntityManager();
    }
    // 获取版主管理的社区
    async getManagedCommunities(moderId: string) {
        const moderator = await this.manager.findOneBy(User, { id: moderId });
        //检测是否是版主
        if (moderator?.roles[0].role_name !== 'MODERATOR') {
            return Result.error(
                MessageConstant.USER_NOT_MODERATOR,
                HttpStatus.UNAUTHORIZED,
                null,
            );
        }
        //获取版主管理的社区
        const data = moderator.managed_communities.map((item) => {
            return {
                id: item.id,
                name: item.title,
                description: item.description,
            };
        });
        return Result.success(MessageConstant.SUCCESS, data);
    }

    // 分页获取内容审核
    async getCommunityContentPaginated(
        moderId: string,
        communityId: bigint,
        paginationUserContentDto: ModPaginationCommunityContentDto,
    ) {
        const moderator = await this.manager.findOneBy(User, { id: moderId });
        //检测是否是版主
        if (moderator?.roles[0].role_name !== 'MODERATOR') {
            return Result.error(
                MessageConstant.USER_NOT_MODERATOR,
                HttpStatus.UNAUTHORIZED,
                null,
            );
        }
        const { page, pageSize, sortField, sortOrder, search, status, type } =
            paginationUserContentDto;
        const skip = (page - 1) * pageSize;
        const take = pageSize;
        const order = {};
        if (sortField && sortOrder) {
            order[sortField] = sortOrder === 'asc' ? 'ASC' : 'DESC';
        }

        const [contents, total] = await this.manager.findAndCount(UserContent, {
            where: {
                target_communities: {
                    id: communityId,
                },
                status: status
                    ? In(status.split(','))
                    : In([ContentStatus.PENDING, ContentStatus.REJECTED]),
                type: type ? type : undefined,
                title: search ? Like(`%${search}%`) : undefined,
            },
            skip,
            take,
            order,
        });

        const items = await Promise.all(
            contents.map(async (content) => {
                const author = await this.manager.findOneBy(User, {
                    id: content.user_id,
                });
                return {
                    id: content.id,
                    title: content.title,
                    author: author?.username,
                    content: content.content,
                    cover_url: content.cover_url,
                    picture_urls: content.picture_urls,
                    type: content.type,
                    status: content.status,
                    create_time: content.create_time,
                    check_result: content.check_result,
                };
            }),
        );

        return Result.success(MessageConstant.SUCCESS, {
            items,
            total,
            page,
            pageSize,
        });
    }

    async reviewContent(
        moderId: string,
        contentId: bigint,
        action: 'approve' | 'reject',
    ) {
        const moderator = await this.manager.findOneBy(User, { id: moderId });
        //检测是否是版主
        if (moderator?.roles[0].role_name !== 'MODERATOR') {
            return Result.error(
                MessageConstant.USER_NOT_MODERATOR,
                HttpStatus.UNAUTHORIZED,
                null,
            );
        }
        const content = await this.manager.findOneBy(UserContent, {
            id: contentId,
        });
        if (!content) {
            return Result.error(
                MessageConstant.USER_CONTENT_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                null,
            );
        }
        if (action === 'approve') {
            content.status = ContentStatus.APPROVED;
            content.check_result = '复核通过';
            await this.manager.save(content);
            return Result.success(MessageConstant.SUCCESS, null);
        }

        return Result.success(MessageConstant.SUCCESS, null);
    }
}
