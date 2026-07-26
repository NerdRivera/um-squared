import { Router } from "express";
import { authController } from "../controllers";
import { authenticateToken, validate } from "../middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
} from "../schemas";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", validate(refreshSchema), authController.logout);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail
);
router.get("/me", authenticateToken, authController.me);

export default router;
