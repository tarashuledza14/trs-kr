import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateTestDto, TestsService } from './tests.service';

@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  list() {
    return this.testsService.list();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.testsService.getById(id);
  }

  @Post()
  create(@Body() payload: CreateTestDto) {
    return this.testsService.create(payload);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.testsService.delete(id);
  }
}
