import prisma from "../config/database";
import type { OrgApplicationModel } from "../generated/prisma/models";
import type { ApplicationStatus, OrgCategory } from "../generated/prisma/enums";

export interface CreateOrgApplicationInput {
  userId: string;
  organizationName: string;
  description: string;
  category: OrgCategory;
  contactInfo: string;
}

/**
 * Data access layer for the OrgApplication model.
 */
export class OrgApplicationRepository {
  findById(id: string): Promise<OrgApplicationModel | null> {
    return prisma.orgApplication.findUnique({ where: { id } });
  }

  findByUserId(userId: string): Promise<OrgApplicationModel | null> {
    return prisma.orgApplication.findUnique({ where: { userId } });
  }

  list(status?: ApplicationStatus): Promise<OrgApplicationModel[]> {
    return prisma.orgApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  create(input: CreateOrgApplicationInput): Promise<OrgApplicationModel> {
    return prisma.orgApplication.create({ data: input });
  }

  updateStatus(
    id: string,
    status: ApplicationStatus,
    rejectedReason?: string | null
  ): Promise<OrgApplicationModel> {
    return prisma.orgApplication.update({
      where: { id },
      data: { status, rejectedReason: rejectedReason ?? null },
    });
  }
}
