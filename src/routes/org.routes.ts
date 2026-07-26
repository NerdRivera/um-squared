import { Router } from "express";
import { orgController } from "../controllers";
import { authenticateToken, requireRole, validate } from "../middleware";
import {
  applyOrgSchema,
  orgApplicationDecisionSchema,
  updateOrganizationSchema,
} from "../schemas";
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

// Organization profile routes (Story 3.2). Must be declared after the
// literal /apply and /applications routes above so ":id" doesn't shadow them.
router.get("/:id", orgController.getOrganization);

router.patch(
  "/:id",
  authenticateToken,
  validate(updateOrganizationSchema),
  orgController.updateOrganization
);

router.get("/:id/posts", orgController.listOrganizationPosts);

router.get("/:id/events", orgController.listOrganizationEvents);

export default router;
