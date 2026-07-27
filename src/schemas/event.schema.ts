import { z } from "zod";
import { RSVPStatus } from "../generated/prisma/enums";

export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  location: z.string().min(1).max(500),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  capacity: z.number().int().positive().nullable().optional(),
});

export const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  location: z.string().min(1).max(500).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  capacity: z.number().int().positive().nullable().optional(),
});

export const rsvpSchema = z.object({
  status: z.nativeEnum(RSVPStatus),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type RsvpDto = z.infer<typeof rsvpSchema>;
