import { Module } from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { DataAnalysisController } from './data_analysis.controller';

@Module({
  controllers: [DataAnalysisController],
  providers: [DataAnalysisService],
})
export class DataAnalysisModule {}
