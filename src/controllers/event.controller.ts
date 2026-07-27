import { Response } from "express";
import { EventService } from "../services";
import type { AuthRequest } from "../middleware";
import { createEventSchema, updateEventSchema, rsvpSchema } from "../schemas";
import { ValidationError } from "../utils";

const eventService = new EventService();

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const result = createEventSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const event = await eventService.createForPost(req.user!, postId, result.data);
  res.status(201).json({ event });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const eventId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const event = await eventService.getById(eventId);
  res.status(200).json({ event });
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const result = updateEventSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const eventId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const event = await eventService.update(req.user!, eventId, result.data);
  res.status(200).json({ event });
}

export async function rsvp(req: AuthRequest, res: Response): Promise<void> {
  const result = rsvpSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const eventId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const event = await eventService.rsvp(req.user!, eventId, result.data);
  res.status(200).json({ event });
}

export async function listRsvps(req: AuthRequest, res: Response): Promise<void> {
  const eventId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const rsvps = await eventService.listRsvps(eventId);
  res.status(200).json({ rsvps });
}
