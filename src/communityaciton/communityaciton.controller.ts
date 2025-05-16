import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { CommunityacitonService } from './communityaciton.service';
import { CreateCommunityacitonDto } from './dto/create-communityaciton.dto';
import { UpdateCommunityacitonDto } from './dto/update-communityaciton.dto';

@Controller('communityaciton')
export class CommunityacitonController {
    constructor(
        private readonly communityacitonService: CommunityacitonService,
    ) {}
}
