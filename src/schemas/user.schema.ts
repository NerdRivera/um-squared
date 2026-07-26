import { z } from "zod";
import { Role } from "../generated/prisma/enums";

export const assignRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export type AssignRoleDto = z.infer<typeof assignRoleSchema>;
