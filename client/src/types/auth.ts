export enum Role {
  STUDENT = "STUDENT",
  ORG_MEMBER = "ORG_MEMBER",
  ORG_ADMIN = "ORG_ADMIN",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  verifiedAt: string | null;
  role: Role;
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
}
