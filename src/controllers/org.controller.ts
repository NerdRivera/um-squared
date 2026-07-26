import { Response } from "express";
import { OrgApplicationService } from "../services";
import type { AuthRequest } from "../middleware";
import { listOrgApplicationsSchema } from "../schemas";
import type { ApplyOrgDto, OrgApplicationDecisionDto } from "../schemas";
import { ValidationError } from "../utils";

const orgApplicationService = new OrgApplicationService();

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
