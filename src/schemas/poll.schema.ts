import { z } from "zod";

export const createPollSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(z.string().min(1).max(200)).min(2).max(10),
  singleChoice: z.boolean().optional(),
  allowVoteChange: z.boolean().optional(),
  hideResults: z.boolean().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

export const votePollSchema = z.object({
  optionIds: z.array(z.string().min(1)).min(1).max(5),
});

export const updatePollSettingsSchema = z.object({
  singleChoice: z.boolean().optional(),
  allowVoteChange: z.boolean().optional(),
  hideResults: z.boolean().optional(),
  endsAt: z.coerce.date().nullable().optional(),
});

export type CreatePollDto = z.infer<typeof createPollSchema>;
export type VotePollDto = z.infer<typeof votePollSchema>;
export type UpdatePollSettingsDto = z.infer<typeof updatePollSettingsSchema>;
