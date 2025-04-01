import { DataSource, EntityManager } from 'typeorm';
import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommunityacitonDto } from './dto/create-communityaciton.dto';
import { UpdateCommunityacitonDto } from './dto/update-communityaciton.dto';
import { AddLikeDto } from './dto/add-like.dto';
import { MessageConstant } from 'src/common/constants';
import {
    Interaction,
    InteractionType,
    TargetType,
} from 'src/common/entity/interaction.entity';
import { Result } from 'src/common/result/Result';
import { AddCollectDto } from './dto/add-collect.dto';

@Injectable()
export class CommunityacitonService {
    private readonly manager: EntityManager;

    constructor(private readonly dataSource: DataSource) {
        this.manager = this.dataSource.manager;
    }

    create(createCommunityacitonDto: CreateCommunityacitonDto) {
        return 'This action adds a new communityaciton';
    }

    findAll() {
        return `This action returns all communityaciton`;
    }

    findOne(id: number) {
        return `This action returns a #${id} communityaciton`;
    }

    update(id: number, updateCommunityacitonDto: UpdateCommunityacitonDto) {
        return `This action updates a #${id} communityaciton`;
    }

    remove(id: number) {
        return `This action removes a #${id} communityaciton`;
    }
    // 获取用户点赞
    async getUserLikes(user_id:string){
        const likes = await this.manager.find(Interaction,{
            where:{
              user_id,
              type: InteractionType.LIKE,
            }
        })
        return Result.success(MessageConstant.SUCCESS, likes);
    }

    // 新增点赞和取消点赞
    async addLike(user_id: string, addLikeDto: AddLikeDto) {
        // 判断是否已经点赞
        const existInteraction = await this.manager.findOne(Interaction, {
            where: {
                user_id,
                target_type: addLikeDto.target_type,
                target_id: addLikeDto.target_id as unknown as bigint,
                type: InteractionType.LIKE,
            },
        });
        if (existInteraction) {
            await this.manager.delete(Interaction, existInteraction.id);
            return Result.success(MessageConstant.SUCCESS, null);
        }
        // 新增点赞
        const interaction = this.manager.create(Interaction, {
            user_id,
            target_type: addLikeDto.target_type,
            target_id: addLikeDto.target_id as unknown as bigint,
            type: InteractionType.LIKE,
        });
        await this.manager.save(interaction);
        return Result.success(MessageConstant.SUCCESS, null);
    }

    // 获取用户收藏
    async getUserCollects(user_id:string){
        const collects = await this.manager.find(Interaction,{
            where:{
              user_id,
              type: InteractionType.COLLECT,
            }
        })
        return Result.success(MessageConstant.SUCCESS, collects);
    }
    //新增收藏
    async addCollect(user_id: string, addCollectDto: AddCollectDto) {
      if(addCollectDto.target_type!== TargetType.CONTENT){
          return Result.error(
            MessageConstant.ILLEGAL_VALUE,
            HttpStatus.BAD_REQUEST,
            null,
          );
      }
      // 判断是否已经收藏
      const existInteraction = await this.manager.findOne(Interaction, {
        where: {
          user_id,
          target_type: addCollectDto.target_type,
          target_id: addCollectDto.target_id as unknown as bigint,
          type: InteractionType.COLLECT,
        },
      });
      if (existInteraction) {
        await this.manager.delete(Interaction, existInteraction.id);
      }
      // 新增收藏
      const interaction = this.manager.create(Interaction, {
        user_id,
        target_type: addCollectDto.target_type,
        target_id: addCollectDto.target_id as unknown as bigint,
        type: InteractionType.COLLECT,
      });
      
      await this.manager.save(interaction);
      return Result.success(MessageConstant.SUCCESS, null);
    }
}
