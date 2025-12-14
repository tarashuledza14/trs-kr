import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateQuestionDto {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface CreateTestDto {
  title: string;
  authorId: string;
  questions: CreateQuestionDto[];
}

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
      include: { questions: true },
    });
  }

  async getById(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    return test;
  }

  async create(payload: CreateTestDto) {
    const created = await this.prisma.test.create({
      data: {
        title: payload.title,
        authorId: payload.authorId,
        questions: {
          create: payload.questions.map((q) => ({
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
          })),
        },
      },
      include: { questions: true },
    });

    return created;
  }

  async delete(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
    });

    if (!test) {
      throw new NotFoundException('Test not found');
    }

    await this.prisma.test.delete({
      where: { id },
    });

    await this.prisma.testResult.deleteMany({
      where: { testId: id },
    });

    return { message: 'Test deleted successfully' };
  }
}
