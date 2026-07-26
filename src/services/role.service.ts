import { UserRepository } from "../repositories";
import { Role } from "../generated/prisma/enums";
import { ForbiddenError, NotFoundError } from "../utils";
import { sanitizeUser, type SafeUser } from "./auth.service";

export interface ActingUser {
  id: string;
  role: string;
}

/**
 * Business logic for role assignment and permission checks. Enforces
 * that only platform admins can change a user's role, in addition to the
 * `requireRole` route middleware (defense in depth for any future caller).
 */
export class RoleService {
  constructor(private userRepository = new UserRepository()) {}

  canAssignRoles(actingUser: ActingUser): boolean {
    return actingUser.role === Role.PLATFORM_ADMIN;
  }

  async assignRole(
    actingUser: ActingUser,
    targetUserId: string,
    newRole: Role
  ): Promise<SafeUser> {
    if (!this.canAssignRoles(actingUser)) {
      throw new ForbiddenError("Only platform admins can assign roles");
    }

    const target = await this.userRepository.findById(targetUserId);
    if (!target) {
      throw new NotFoundError("User", targetUserId);
    }

    const updated = await this.userRepository.updateRole(targetUserId, newRole);
    return sanitizeUser(updated);
  }
}
