import prisma from "../config/database";
import { Prisma } from "../generated/prisma/client";
import type { OrganizationModel, PostModel, EventModel } from "../generated/prisma/models";
import { OrgCategory, PostStatus, PostVisibility } from "../generated/prisma/enums";

export interface CreateOrganizationInput {
  name: string;
  description: string;
  category: OrgCategory;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  category?: OrgCategory;
  coverImageUrl?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  socialLinks?: Record<string, string> | null;
}

export interface PaginationOptions {
  skip: number;
  take: number;
}

/**
 * Data access layer for the Organization model. Full profile/member
 * management (Story 3.2) builds on top of this.
 */
export class OrganizationRepository {
  findById(id: string): Promise<OrganizationModel | null> {
    return prisma.organization.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<OrganizationModel | null> {
    return prisma.organization.findUnique({ where: { name } });
  }

  create(input: CreateOrganizationInput): Promise<OrganizationModel> {
    return prisma.organization.create({ data: input });
  }

  update(id: string, input: UpdateOrganizationInput): Promise<OrganizationModel> {
    const { socialLinks, ...rest } = input;
    return prisma.organization.update({
      where: { id },
      data: {
        ...rest,
        ...(socialLinks !== undefined && {
          socialLinks: socialLinks === null ? Prisma.JsonNull : socialLinks,
        }),
      },
    });
  }

  listPublishedPosts(organizationId: string, { skip, take }: PaginationOptions): Promise<PostModel[]> {
    return prisma.post.findMany({
      where: { organizationId, status: PostStatus.PUBLISHED, visibility: PostVisibility.PUBLIC },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }

  listUpcomingEvents(
    organizationId: string,
    { skip, take }: PaginationOptions
  ): Promise<(EventModel & { post: PostModel })[]> {
    return prisma.event.findMany({
      where: {
        post: { organizationId, status: PostStatus.PUBLISHED, visibility: PostVisibility.PUBLIC },
      },
      include: { post: true },
      orderBy: { startTime: "asc" },
      skip,
      take,
    });
  }
}

