import prisma from "../config/database";
import type { PostModel, PostAttachmentModel } from "../generated/prisma/models";
import { PostStatus, PostVisibility, FileType, PostType } from "../generated/prisma/enums";

export interface CreatePostInput {
  organizationId: string;
  type: PostType;
  content: string;
  title?: string | null;
  linkUrl?: string | null;
  status?: PostStatus;
  visibility?: PostVisibility;
}

export interface UpdatePostInput {
  title?: string | null;
  content?: string | null;
  type?: PostType;
  linkUrl?: string | null;
  status?: PostStatus;
  visibility?: PostVisibility;
}

export interface CreateAttachmentInput {
  postId: string;
  fileName: string;
  fileUrl: string;
  fileType: FileType;
  fileSize: number;
  mimeType: string;
}

export class PostRepository {
  async findById(id: string): Promise<(PostModel & { attachments: PostAttachmentModel[] }) | null> {
    return prisma.post.findUnique({
      where: { id },
      include: { attachments: true },
    }) as Promise<(PostModel & { attachments: PostAttachmentModel[] }) | null>;
  }

  create(input: CreatePostInput): Promise<PostModel> {
    return prisma.post.create({
      data: {
        organizationId: input.organizationId,
        type: input.type,
        content: input.content,
        title: input.title ?? null,
        linkUrl: input.linkUrl ?? null,
        status: input.status ?? PostStatus.PUBLISHED,
        visibility: input.visibility ?? PostVisibility.PUBLIC,
      },
    });
  }

  async replaceAttachments(postId: string, attachments: CreateAttachmentInput[]): Promise<PostAttachmentModel[]> {
    await prisma.postAttachment.deleteMany({ where: { postId } });

    if (attachments.length === 0) {
      return [];
    }

    return prisma.postAttachment.createManyAndReturn({
      data: attachments.map((attachment) => ({
        postId: attachment.postId,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
      })),
    });
  }

  createAttachments(attachments: CreateAttachmentInput[]): Promise<PostAttachmentModel[]> {
    if (attachments.length === 0) {
      return Promise.resolve([]);
    }

    return prisma.postAttachment.createManyAndReturn({
      data: attachments.map((attachment) => ({
        postId: attachment.postId,
        fileName: attachment.fileName,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
      })),
    });
  }

  async update(id: string, input: UpdatePostInput): Promise<(PostModel & { attachments: PostAttachmentModel[] })> {
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title ?? null;
    if (input.content !== undefined) data.content = input.content;
    if (input.type !== undefined) data.type = input.type;
    if (input.linkUrl !== undefined) data.linkUrl = input.linkUrl ?? null;
    if (input.status !== undefined) data.status = input.status;
    if (input.visibility !== undefined) data.visibility = input.visibility;

    const post = await prisma.post.update({
      where: { id },
      data,
      include: { attachments: true },
    });

    return post as unknown as (PostModel & { attachments: PostAttachmentModel[] });
  }

  delete(id: string): Promise<PostModel> {
    return prisma.post.delete({ where: { id } });
  }
}
