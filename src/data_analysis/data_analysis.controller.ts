import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { CreateDataAnalysisDto } from './dto/create-data_analysis.dto';
import { UpdateDataAnalysisDto } from './dto/update-data_analysis.dto';

@Controller('data-analysis')
export class DataAnalysisController {
  constructor(private readonly dataAnalysisService: DataAnalysisService) {}

  @Post()
  create(@Body() createDataAnalysisDto: CreateDataAnalysisDto) {
    return this.dataAnalysisService.create(createDataAnalysisDto);
  }

  @Get()
  findAll() {
    return this.dataAnalysisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dataAnalysisService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDataAnalysisDto: UpdateDataAnalysisDto) {
    return this.dataAnalysisService.update(+id, updateDataAnalysisDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dataAnalysisService.remove(+id);
  }
}
