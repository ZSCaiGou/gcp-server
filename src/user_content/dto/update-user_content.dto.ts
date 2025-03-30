import { PartialType } from '@nestjs/swagger';
import { CreateUserContentDto } from './create-user_content.dto';

export class UpdateUserContentDto extends PartialType(CreateUserContentDto) {}
