import { Response } from "express";
import { PostService } from "../services";
import type { AuthRequest } from "../middleware";
import { createPostSchema, updatePostSchema } from "../schemas";
import { ValidationError } from "../utils";
import { FileType } from "../generated/prisma/enums";

const postService = new PostService();

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const result = createPostSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const attachments = buildAttachmentPayload(req);

  const post = await postService.create(req.user!, {
    ...result.data,
    attachments,
  });

  res.status(201).json({ post });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const post = await postService.getById(postId);
  res.status(200).json({ post });
}

export async function update(req: AuthRequest, res: Response): Promise<void> {
  const result = updatePostSchema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `${issue.path.join(".")}:${issue.message}`);
    throw new ValidationError("Request validation failed", details);
  }

  const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const attachments = buildAttachmentPayload(req);
  const post = await postService.update(req.user!, postId, result.data, attachments);
  res.status(200).json({ post });
}

export async function remove(req: AuthRequest, res: Response): Promise<void> {
  const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const post = await postService.remove(req.user!, postId);
  res.status(200).json({ post });
}

function buildAttachmentPayload(req: AuthRequest) {
  const files = Array.isArray((req as any).files) ? ((req as any).files as Express.Multer.File[]) : [];

  if (files.length === 0) {
    return undefined;
  }

  return files.map((file) => ({
    fileName: file.originalname,
    fileUrl: `/static/uploads/${file.filename}`,
    fileType: inferFileType(file.mimetype),
    fileSize: file.size,
    mimeType: file.mimetype,
  }));
}

function inferFileType(mimeType: string): FileType {
  if (mimeType.startsWith("image/")) return FileType.IMAGE;
  if (mimeType.startsWith("video/")) return FileType.VIDEO;
  if (mimeType.startsWith("audio/")) return FileType.AUDIO;
  return FileType.IMAGE;
}
