import { Response } from "express";
import { OrgApplicationService, OrganizationService } from "../services";
import type { AuthRequest } from "../middleware";
import { listOrgApplicationsSchema, paginationQuerySchema } from "../schemas";
import type {
  ApplyOrgDto,
  OrgApplicationDecisionDto,
  UpdateOrganizationDto,
} from "../schemas";
import { ValidationError } from "../utils";

const orgApplicationService = new OrgApplicationService();
const organizationService = new OrganizationService();

export async function apply(req: AuthRequest, res: Response): Promise<void> {
  const input = req.body as ApplyOrgDto;
  const application = await orgApplicationService.apply(req.user!.id, input);
  res.status(201).json({ application });
}

export async function listApplications(req: AuthRequest, res: Response): Promise<void> {
  const result = listOrgApplicationsSchema.safeParse(req.query);
  if (!result.success) {
    const details = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    throw new ValidationError("Request validation failed", details);
  }
  const applications = await orgApplicationService.list(req.user!, result.data.status);
  res.status(200).json({ applications });
}

export async function decideApplication(req: AuthRequest, res: Response): Promise<void> {
  const decision = req.body as OrgApplicationDecisionDto;
  const applicationId = req.params.id as string;
  const application = await orgApplicationService.decide(req.user!, applicationId, decision);
  res.status(200).json({ application });
}

export async function getOrganization(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const organization = await organizationService.getById(id);
  res.status(200).json({ organization });
}

export async function updateOrganization(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const input = req.body as UpdateOrganizationDto;
  const organization = await organizationService.update(req.user!, id, input);
  res.status(200).json({ organization });
}

export async function listOrganizationPosts(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = paginationQuerySchema.safeParse(req.query);
  if (!result.success) {
    const details = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    throw new ValidationError("Request validation failed", details);
  }
  const posts = await organizationService.listPosts(id, result.data);
  res.status(200).json({ posts });
}

export async function listOrganizationEvents(req: AuthRequest, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = paginationQuerySchema.safeParse(req.query);
  if (!result.success) {
    const details = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    throw new ValidationError("Request validation failed", details);
  }
  const events = await organizationService.listEvents(id, result.data);
  res.status(200).json({ events });
}
