import { z } from "zod";
import { PostStatus, PostType, PostVisibility } from "../generated/prisma/enums";

export const createPostSchema = z.object({
  organizationId: z.string().min(1),
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(5000),
  type: z.nativeEnum(PostType).default(PostType.TEXT),
  linkUrl: z.string().url().optional().nullable(),
  status: z.nativeEnum(PostStatus).optional(),
  visibility: z.nativeEnum(PostVisibility).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  content: z.string().min(1).max(5000).optional(),
  type: z.nativeEnum(PostType).optional(),
  linkUrl: z.string().url().nullable().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  visibility: z.nativeEnum(PostVisibility).optional(),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
