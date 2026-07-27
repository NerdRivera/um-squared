import { Router } from "express";
import { eventController } from "../controllers";
import { authenticateToken, validate } from "../middleware";
import { createEventSchema, updateEventSchema, rsvpSchema } from "../schemas";

const router = Router();

router.post("/posts/:postId/events", authenticateToken, validate(createEventSchema), eventController.create);
router.get("/events/:id", authenticateToken, eventController.getById);
router.patch("/events/:id", authenticateToken, validate(updateEventSchema), eventController.update);
router.post("/events/:id/rsvp", authenticateToken, validate(rsvpSchema), eventController.rsvp);
router.get("/events/:id/rsvps", authenticateToken, eventController.listRsvps);

export default router;
