import { Injectable } from '@nestjs/common';
import { CreateDataAnalysisDto } from './dto/create-data_analysis.dto';
import { UpdateDataAnalysisDto } from './dto/update-data_analysis.dto';

@Injectable()
export class DataAnalysisService {
  create(createDataAnalysisDto: CreateDataAnalysisDto) {
    return 'This action adds a new dataAnalysis';
  }

  findAll() {
    return `This action returns all dataAnalysis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dataAnalysis`;
  }

  update(id: number, updateDataAnalysisDto: UpdateDataAnalysisDto) {
    return `This action updates a #${id} dataAnalysis`;
  }

  remove(id: number) {
    return `This action removes a #${id} dataAnalysis`;
  }
}
