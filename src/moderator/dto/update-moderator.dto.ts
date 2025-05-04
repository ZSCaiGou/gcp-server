import { PartialType } from '@nestjs/swagger';
import { CreateModeratorDto } from './create-moderator.dto';

export class UpdateModeratorDto extends PartialType(CreateModeratorDto) {}
