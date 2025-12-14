import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ResultsService, SubmitResultDto } from './results.service';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  submit(@Body() payload: SubmitResultDto) {
    return this.resultsService.submit(payload);
  }

  @Get('by-test/:testId')
  listByTest(@Param('testId') testId: string) {
    return this.resultsService.listByTest(testId);
  }

  @Get('by-student/:studentId')
  listByStudent(@Param('studentId') studentId: string) {
    return this.resultsService.listByStudent(studentId);
  }
}
