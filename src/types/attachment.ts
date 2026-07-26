export enum AttachmentType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  DOCUMENT = "DOCUMENT",
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  type: AttachmentType;
  url: string;
  createdAt: Date;
}

export interface AttachmentInput {
  filename: string;
  mimeType: string;
  size: number;
  type: AttachmentType;
  buffer: Buffer;
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "audio/mpeg", "audio/wav", "application/pdf"].includes(mimeType);
}

export function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith("image/")) return AttachmentType.IMAGE;
  if (mimeType.startsWith("video/")) return AttachmentType.VIDEO;
  if (mimeType.startsWith("audio/")) return AttachmentType.AUDIO;
  return AttachmentType.DOCUMENT;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
