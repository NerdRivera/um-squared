import { Response } from "express";
import { PollService } from "../services";
import type { AuthRequest } from "../middleware";
import { createPollSchema, updatePollSettingsSchema, votePollSchema } from "../schemas";
import { ValidationError } from "../utils";

const pollService = new PollService();

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const result = createPollSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const postId = Array.isArray(req.params.postId) ? req.params.postId[0] : req.params.postId;
  const poll = await pollService.createForPost(req.user!, postId, result.data);
  res.status(201).json({ poll });
}

export async function vote(req: AuthRequest, res: Response): Promise<void> {
  const result = votePollSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const pollId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const poll = await pollService.castVote(req.user!, pollId, result.data.optionIds);
  res.status(200).json({ poll });
}

export async function getResults(req: AuthRequest, res: Response): Promise<void> {
  const pollId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const poll = await pollService.getResults(pollId);
  res.status(200).json({ poll });
}

export async function updateSettings(req: AuthRequest, res: Response): Promise<void> {
  const result = updatePollSettingsSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const pollId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const poll = await pollService.updateSettings(req.user!, pollId, result.data);
  res.status(200).json({ poll });
}
