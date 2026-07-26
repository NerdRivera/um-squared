import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import ms from "ms";
import { UserRepository, RefreshTokenRepository } from "../repositories";
import type { UserModel } from "../generated/prisma/models";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailVerificationToken,
  verifyEmailVerificationToken,
} from "../utils/jwt";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { env } from "../config";

const SALT_ROUNDS = 10;

export type SafeUser = Omit<UserModel, "password">;

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CasProfileInput {
  netid: string;
  email: string;
}

function sanitizeUser(user: UserModel): SafeUser {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

/**
 * Business logic for registration, login, token refresh/rotation,
 * logout, and email verification.
 */
export class AuthService {
  constructor(
    private userRepository = new UserRepository(),
    private refreshTokenRepository = new RefreshTokenRepository()
  ) {}

  private async issueTokens(user: UserModel): Promise<AuthTokens> {
    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const jti = randomUUID();
    const expiresAt = new Date(Date.now() + ms(env.JWT_REFRESH_TTL as ms.StringValue));
    await this.refreshTokenRepository.create(user.id, jti, expiresAt);
    const refreshToken = signRefreshToken({ id: user.id, jti });

    return { accessToken, refreshToken };
  }

  async register(
    input: RegisterInput
  ): Promise<{ user: SafeUser } & AuthTokens> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
      displayName: input.displayName,
    });

    // No email delivery infrastructure yet; log the verification link for
    // local/dev use until an email provider is wired up.
    const verificationToken = signEmailVerificationToken(user.id);
    console.log(
      `[auth] Email verification token for ${user.email}: ${verificationToken}`
    );

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  async login(input: LoginInput): Promise<{ user: SafeUser } & AuthTokens> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  /**
   * Logs in a user authenticated via UMass CAS. Auto-links to an existing
   * account by email, or creates a new (password-less, pre-verified)
   * account if none exists. CAS itself is the source of truth for identity,
   * so accounts are always marked verified on CAS login.
   */
  async loginWithCas(
    profile: CasProfileInput
  ): Promise<{ user: SafeUser } & AuthTokens> {
    let user = await this.userRepository.findByEmail(profile.email);
    if (!user) {
      user = await this.userRepository.create({
        email: profile.email,
        displayName: profile.netid,
      });
    }
    if (!user.emailVerified) {
      user = await this.userRepository.markEmailVerified(user.id);
    }

    const tokens = await this.issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  }

  /**
   * Verifies and rotates a refresh token: the old token is revoked and a new
   * access/refresh pair is issued. Rejects reused or revoked tokens.
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const stored = await this.refreshTokenRepository.findById(payload.jti);
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.userRepository.findById(payload.id);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await this.refreshTokenRepository.revoke(stored.id);
    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await this.refreshTokenRepository.revoke(payload.jti);
    } catch {
      // Already invalid/expired: logout is a no-op in that case.
    }
  }

  async verifyEmail(token: string): Promise<void> {
    let userId: string;
    try {
      userId = verifyEmailVerificationToken(token);
    } catch {
      throw new ValidationError("Invalid or expired verification token");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    await this.userRepository.markEmailVerified(userId);
  }

  async me(userId: string): Promise<SafeUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }
    return sanitizeUser(user);
  }
}
