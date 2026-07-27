import { Router } from "express";
import { pollController } from "../controllers";
import { authenticateToken, validate } from "../middleware";
import { createPollSchema, votePollSchema, updatePollSettingsSchema } from "../schemas";

const router = Router();

router.post("/posts/:postId/polls", authenticateToken, validate(createPollSchema), pollController.create);
router.post("/polls/:id/vote", authenticateToken, validate(votePollSchema), pollController.vote);
router.get("/polls/:id/results", authenticateToken, pollController.getResults);
router.patch("/polls/:id/settings", authenticateToken, validate(updatePollSettingsSchema), pollController.updateSettings);

export default router;
