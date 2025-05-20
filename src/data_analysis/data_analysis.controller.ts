import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Res,
} from '@nestjs/common';
import { DataAnalysisService } from './data_analysis.service';
import { CreateDataAnalysisDto } from './dto/create-data_analysis.dto';
import { UpdateDataAnalysisDto } from './dto/update-data_analysis.dto';
import { Response } from 'express';

@Controller('data-analysis')
export class DataAnalysisController {
    constructor(private readonly dataAnalysisService: DataAnalysisService) {}

    @Get('community/:communityId')
    async getRecent7DaysDataAnalysis(
        @Param('communityId') communityId: bigint,
        @Res() res: Response,
    ) {
        const result =
            await this.dataAnalysisService.getRecent7DaysDataAnalysis(
                communityId,
            );
        res.status(result.StatuCode).send(result);
    }

    @Get('system')
    async getSystemDataAnalysis(@Res() res: Response) {
        const result = await this.dataAnalysisService.getSystemDataAnalysis();
        res.status(result.StatuCode).send(result);
    }
}
