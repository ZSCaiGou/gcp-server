import { PartialType } from '@nestjs/swagger';
import { CreateCommunityacitonDto } from './create-communityaciton.dto';

export class UpdateCommunityacitonDto extends PartialType(CreateCommunityacitonDto) {}
