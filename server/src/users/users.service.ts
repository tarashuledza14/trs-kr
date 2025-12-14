import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(role?: Role) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { name: 'asc' },
    });
    return users;
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async studentsList(role?: Role) {
    const users = await this.prisma.user.findMany({
      where: {
        role: role || Role.student,
      },
      orderBy: { name: 'asc' },
    });
    if (!users) {
      throw new NotFoundException('No students found');
    }
    return users;
  }
}
