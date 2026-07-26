import { Attachment } from "./attachment";

export enum PostType {
  TEXT = "TEXT",
  MEDIA = "MEDIA",
  LINK = "LINK",
  POLL = "POLL",
  EVENT = "EVENT",
}

export enum PostStatus {
  PUBLISHED = "PUBLISHED",
  PENDING = "PENDING",
  DRAFT = "DRAFT",
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: PostType;
  status: PostStatus;
  organizationId: string;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostInput {
  title: string;
  content: string;
  type: PostType;
  organizationId: string;
  attachments?: Attachment[];
}

export interface PostUpdateInput {
  title?: string;
  content?: string;
  type?: PostType;
  attachments?: Attachment[];
}
