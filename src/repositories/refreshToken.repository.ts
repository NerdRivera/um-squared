import prisma from "../config/database";
import type { RefreshTokenModel } from "../generated/prisma/models";

/**
 * Data access layer for the RefreshToken model.
 * Backs refresh token rotation and revocation (logout, reuse detection).
 */
export class RefreshTokenRepository {
  create(userId: string, id: string, expiresAt: Date): Promise<RefreshTokenModel> {
    return prisma.refreshToken.create({
      data: { id, userId, expiresAt },
    });
  }

  findById(id: string): Promise<RefreshTokenModel | null> {
    return prisma.refreshToken.findUnique({ where: { id } });
  }

  revoke(id: string): Promise<RefreshTokenModel> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  revokeAllForUser(userId: string): Promise<{ count: number }> {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
