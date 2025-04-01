import { Injectable } from '@nestjs/common';
import { CreateCommunityacitonDto } from './dto/create-communityaciton.dto';
import { UpdateCommunityacitonDto } from './dto/update-communityaciton.dto';

@Injectable()
export class CommunityacitonService {
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
}
