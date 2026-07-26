import { Request, RequestHandler, Response } from "express";
import { env } from "../config";
import { AuthService } from "../services";
import { CAS_CALLBACK_URL, UnauthorizedError, verifyCasTicket } from "../utils";
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

export const casLogin: RequestHandler = (_req, res) => {
  const loginUrl = `${env.CAS_BASE_URL}/login?service=${encodeURIComponent(
    CAS_CALLBACK_URL
  )}`;
  res.redirect(loginUrl);
};

export const casCallback: RequestHandler = async (req, res, next) => {
  try {
    const ticket = req.query.ticket;
    if (typeof ticket !== "string" || !ticket) {
      throw new UnauthorizedError("Missing CAS ticket");
    }

    const casProfile = await verifyCasTicket(ticket, CAS_CALLBACK_URL);
    const result = await authService.loginWithCas(casProfile);

    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(`${env.FRONTEND_URL}/auth/cas-callback?${params}`);
  } catch (err) {
    next(err);
  }
};

export const casLogout: RequestHandler = (_req, res) => {
  // Stateless JWT auth means there is no server-side session to invalidate
  // here; local refresh-token revocation is handled by POST /auth/logout.
  // This endpoint only tears down the CAS SSO session.
  const logoutUrl = `${env.CAS_BASE_URL}/logout?service=${encodeURIComponent(
    env.FRONTEND_URL
  )}`;
  res.redirect(logoutUrl);
};
