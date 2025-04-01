import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommunityacitonService } from './communityaciton.service';
import { CreateCommunityacitonDto } from './dto/create-communityaciton.dto';
import { UpdateCommunityacitonDto } from './dto/update-communityaciton.dto';

@Controller('communityaciton')
export class CommunityacitonController {
  constructor(private readonly communityacitonService: CommunityacitonService) {}

  @Post()
  create(@Body() createCommunityacitonDto: CreateCommunityacitonDto) {
    return this.communityacitonService.create(createCommunityacitonDto);
  }

  @Get()
  findAll() {
    return this.communityacitonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityacitonService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityacitonDto: UpdateCommunityacitonDto) {
    return this.communityacitonService.update(+id, updateCommunityacitonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityacitonService.remove(+id);
  }
}
