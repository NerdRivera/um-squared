import { z } from "zod";
import { OrgCategory } from "../generated/prisma/enums";

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: z.nativeEnum(OrgCategory).optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  socialLinks: z.record(z.string(), z.string().url()).nullable().optional(),
});

export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;
