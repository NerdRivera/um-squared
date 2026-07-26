import { Router } from "express";
import { userController } from "../controllers";
import { authenticateToken, requireRole, validate } from "../middleware";
import { assignRoleSchema } from "../schemas";
import { Role } from "../generated/prisma/enums";

const router = Router();

router.patch(
  "/:userId/role",
  authenticateToken,
  requireRole(Role.PLATFORM_ADMIN),
  validate(assignRoleSchema),
  userController.assignRole
);

export default router;
