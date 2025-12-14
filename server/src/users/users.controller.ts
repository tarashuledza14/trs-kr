import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import { Role } from '../../generated/prisma';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(
    @Query('role', new ParseEnumPipe(Role, { optional: true })) role?: Role,
  ) {
    return this.usersService.list(role);
  }

  @Get('by-email')
  findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('students')
  studentsList(
    @Query('role', new ParseEnumPipe(Role, { optional: true })) role?: Role,
  ) {
    return this.usersService.studentsList(role);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }
}
