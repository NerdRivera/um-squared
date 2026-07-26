import { Request, Response } from "express";
import { AuthService } from "../services";
import type { AuthRequest } from "../middleware";
import type { RegisterDto, LoginDto, RefreshDto, VerifyEmailDto } from "../schemas";

const authService = new AuthService();

export async function register(req: Request, res: Response): Promise<void> {
  const input = req.body as RegisterDto;
  const result = await authService.register(input);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginDto;
  const result = await authService.login(input);
  res.status(200).json(result);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshDto;
  const result = await authService.refresh(refreshToken);
  res.status(200).json(result);
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshDto;
  await authService.logout(refreshToken);
  res.status(204).send();
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.body as VerifyEmailDto;
  await authService.verifyEmail(token);
  res.status(200).json({ message: "Email verified successfully" });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  const user = await authService.me(req.user!.id);
  res.status(200).json({ user });
}
