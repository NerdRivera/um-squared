import { Response } from "express";
import { RoleService } from "../services";
import type { AuthRequest } from "../middleware";
import type { AssignRoleDto } from "../schemas";

const roleService = new RoleService();

export async function assignRole(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { role } = req.body as AssignRoleDto;
  const userId = req.params.userId as string;
  const user = await roleService.assignRole(req.user!, userId, role);
  res.status(200).json({ user });
}
