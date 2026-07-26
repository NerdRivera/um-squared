import prisma from "../config/database";
import type { OrganizationModel } from "../generated/prisma/models";
import type { OrgCategory } from "../generated/prisma/enums";

export interface CreateOrganizationInput {
  name: string;
  description: string;
  category: OrgCategory;
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
}
