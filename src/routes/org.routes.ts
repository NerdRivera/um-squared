import { Router } from "express";
import { orgController } from "../controllers";
import { authenticateToken, requireRole, validate } from "../middleware";
import { applyOrgSchema, orgApplicationDecisionSchema } from "../schemas";
import { Role } from "../generated/prisma/enums";

const router = Router();

router.post("/apply", authenticateToken, validate(applyOrgSchema), orgController.apply);

router.get(
  "/applications",
  authenticateToken,
  requireRole(Role.PLATFORM_ADMIN),
  orgController.listApplications
);

router.patch(
  "/applications/:id/decision",
  authenticateToken,
  requireRole(Role.PLATFORM_ADMIN),
  validate(orgApplicationDecisionSchema),
  orgController.decideApplication
);

export default router;
