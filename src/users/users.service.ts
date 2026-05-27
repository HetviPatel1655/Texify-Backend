import { prisma } from "../lib/prisma";

export const UsersService = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }
};
