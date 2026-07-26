import { OrganizationRepository, UserRepository } from "../repositories";
import type { UpdateOrganizationInput, PaginationOptions } from "../repositories";
import { Role } from "../generated/prisma/enums";
import type { OrganizationModel, PostModel, EventModel } from "../generated/prisma/models";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils";
import type { ActingUser } from "./role.service";

export interface ListPageInput {
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function toPagination(input?: ListPageInput): PaginationOptions {
  const page = Math.max(1, input?.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input?.pageSize ?? DEFAULT_PAGE_SIZE));
  return { skip: (page - 1) * pageSize, take: pageSize };
}

/**
 * Business logic for organization profiles: viewing, editing, and listing
 * an organization's posts/events (Story 3.2).
 */
export class OrganizationService {
  constructor(
    private organizationRepository = new OrganizationRepository(),
    private userRepository = new UserRepository()
  ) {}

  async getById(id: string): Promise<OrganizationModel> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new NotFoundError("Organization", id);
    }
    return organization;
  }

  private async canEdit(actingUser: ActingUser, organizationId: string): Promise<boolean> {
    if (actingUser.role === Role.PLATFORM_ADMIN) {
      return true;
    }
    if (actingUser.role !== Role.ORG_ADMIN) {
      return false;
    }
    const user = await this.userRepository.findById(actingUser.id);
    return user?.organizationId === organizationId;
  }

  async update(
    actingUser: ActingUser,
    id: string,
    input: UpdateOrganizationInput
  ): Promise<OrganizationModel> {
    const organization = await this.getById(id);
    if (!(await this.canEdit(actingUser, organization.id))) {
      throw new ForbiddenError("Only that organization's admins can edit its profile");
    }
    if (input.name && input.name !== organization.name) {
      const existing = await this.organizationRepository.findByName(input.name);
      if (existing) {
        throw new ConflictError("An organization with this name already exists");
      }
    }
    return this.organizationRepository.update(id, input);
  }

  async listPosts(organizationId: string, pagination?: ListPageInput): Promise<PostModel[]> {
    await this.getById(organizationId);
    return this.organizationRepository.listPublishedPosts(organizationId, toPagination(pagination));
  }

  async listEvents(
    organizationId: string,
    pagination?: ListPageInput
  ): Promise<(EventModel & { post: PostModel })[]> {
    await this.getById(organizationId);
    return this.organizationRepository.listUpcomingEvents(organizationId, toPagination(pagination));
  }
}
