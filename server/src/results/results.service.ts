import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SubmitResultDto {
  testId: string;
  studentId: string;
  answers: number[];
  score: number;
}

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(payload: SubmitResultDto) {
    const created = await this.prisma.testResult.create({
      data: {
        testId: payload.testId,
        studentId: payload.studentId,
        answers: payload.answers,
        score: payload.score,
      },
    });
    return created;
  }

  listByTest(testId: string) {
    return this.prisma.testResult.findMany({
      where: { testId },
      orderBy: { completedAt: 'desc' },
    });
  }

  listByStudent(studentId: string) {
    return this.prisma.testResult.findMany({
      where: { studentId },
      orderBy: { completedAt: 'desc' },
    });
  }
}
