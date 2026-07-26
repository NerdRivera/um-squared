import { OrgApplicationRepository, OrganizationRepository } from "../repositories";
import prisma from "../config/database";
import { ApplicationStatus, OrgCategory, Role } from "../generated/prisma/enums";
import type { OrgApplicationModel } from "../generated/prisma/models";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils";
import type { ActingUser } from "./role.service";

export interface ApplyOrgInput {
  organizationName: string;
  description: string;
  category: OrgCategory;
  contactInfo: string;
}

export interface OrgDecisionInput {
  status: typeof ApplicationStatus.APPROVED | typeof ApplicationStatus.REJECTED;
  rejectedReason?: string;
}

/**
 * Business logic for organization applications: submission, review, and
 * approve/reject decisions (Story 3.1).
 */
export class OrgApplicationService {
  constructor(
    private orgApplicationRepository = new OrgApplicationRepository(),
    private organizationRepository = new OrganizationRepository()
  ) {}

  canReviewApplications(actingUser: ActingUser): boolean {
    return actingUser.role === Role.PLATFORM_ADMIN;
  }

  async apply(userId: string, input: ApplyOrgInput): Promise<OrgApplicationModel> {
    const existingApplication = await this.orgApplicationRepository.findByUserId(userId);
    if (existingApplication) {
      throw new ConflictError("You have already submitted an organization application");
    }
    const existingOrg = await this.organizationRepository.findByName(input.organizationName);
    if (existingOrg) {
      throw new ConflictError("An organization with this name already exists");
    }
    return this.orgApplicationRepository.create({ userId, ...input });
  }

  async list(actingUser: ActingUser, status?: ApplicationStatus): Promise<OrgApplicationModel[]> {
    if (!this.canReviewApplications(actingUser)) {
      throw new ForbiddenError("Only platform admins can view organization applications");
    }
    return this.orgApplicationRepository.list(status);
  }

  async decide(
    actingUser: ActingUser,
    applicationId: string,
    decision: OrgDecisionInput
  ): Promise<OrgApplicationModel> {
    if (!this.canReviewApplications(actingUser)) {
      throw new ForbiddenError("Only platform admins can decide on organization applications");
    }
    const application = await this.orgApplicationRepository.findById(applicationId);
    if (!application) {
      throw new NotFoundError("OrgApplication", applicationId);
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new ConflictError("This application has already been decided");
    }

    if (decision.status === ApplicationStatus.REJECTED) {
      return this.orgApplicationRepository.updateStatus(
        applicationId,
        ApplicationStatus.REJECTED,
        decision.rejectedReason
      );
    }

    // Approval spans three models (Organization creation, User linking,
    // OrgApplication status) so it is wrapped in a single transaction here
    // rather than split across repository calls, to guarantee atomicity.
    return prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: application.organizationName,
          description: application.description,
          category: application.category,
        },
      });
      await tx.user.update({
        where: { id: application.userId },
        data: { organizationId: organization.id, role: Role.ORG_ADMIN },
      });
      return tx.orgApplication.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.APPROVED },
      });
    });
  }
}
