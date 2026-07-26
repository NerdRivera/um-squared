import { z } from "zod";
import { ApplicationStatus, OrgCategory } from "../generated/prisma/enums";

export const applyOrgSchema = z.object({
  organizationName: z.string().min(2).max(150),
  description: z.string().min(1).max(2000),
  category: z.nativeEnum(OrgCategory),
  contactInfo: z.string().min(1).max(255),
});

export type ApplyOrgDto = z.infer<typeof applyOrgSchema>;

export const listOrgApplicationsSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
});

export type ListOrgApplicationsDto = z.infer<typeof listOrgApplicationsSchema>;

export const orgApplicationDecisionSchema = z
  .object({
    status: z.enum(["APPROVED", "REJECTED"]),
    rejectedReason: z.string().min(1).max(500).optional(),
  })
  .refine((data) => data.status !== ApplicationStatus.REJECTED || !!data.rejectedReason, {
    message: "rejectedReason is required when rejecting an application",
    path: ["rejectedReason"],
  });

export type OrgApplicationDecisionDto = z.infer<typeof orgApplicationDecisionSchema>;
