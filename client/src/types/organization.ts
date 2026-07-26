export enum OrgCategory {
  GREEK_LIFE = "GREEK_LIFE",
  RSO = "RSO",
  INTRAMURAL_SPORTS = "INTRAMURAL_SPORTS",
  OTHER = "OTHER",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  category: OrgCategory;
  coverImageUrl: string | null;
  bio: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | null;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrgApplication {
  id: string;
  userId: string;
  organizationName: string;
  description: string;
  category: OrgCategory;
  contactInfo: string;
  status: ApplicationStatus;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyOrgInput {
  organizationName: string;
  description: string;
  category: OrgCategory;
  contactInfo: string;
}

export interface OrgApplicationDecisionInput {
  status: ApplicationStatus.APPROVED | ApplicationStatus.REJECTED;
  rejectedReason?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  description?: string;
  category?: OrgCategory;
  coverImageUrl?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  socialLinks?: Record<string, string> | null;
}
