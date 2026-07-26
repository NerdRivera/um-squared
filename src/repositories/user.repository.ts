import prisma from "../config/database";
import type { UserModel } from "../generated/prisma/models";
import type { Role } from "../generated/prisma/enums";

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Data access layer for the User model.
 */
export class UserRepository {
  findById(id: string): Promise<UserModel | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<UserModel | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  create(input: CreateUserInput): Promise<UserModel> {
    return prisma.user.create({
      data: {
        email: input.email,
        password: input.password,
        displayName: input.displayName,
      },
    });
  }

  markEmailVerified(id: string): Promise<UserModel> {
    return prisma.user.update({
      where: { id },
      data: { emailVerified: true, verifiedAt: new Date() },
    });
  }

  updatePassword(id: string, password: string): Promise<UserModel> {
    return prisma.user.update({
      where: { id },
      data: { password },
    });
  }

  updateRole(id: string, role: Role): Promise<UserModel> {
    return prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  delete(id: string): Promise<UserModel> {
    return prisma.user.delete({ where: { id } });
  }
}
