import { PartialType } from '@nestjs/swagger';
import { CreateDataAnalysisDto } from './create-data_analysis.dto';

export class UpdateDataAnalysisDto extends PartialType(CreateDataAnalysisDto) {}
