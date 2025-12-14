import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ResultsModule } from './results/results.module';
import { TestsModule } from './tests/tests.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, TestsModule, ResultsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
