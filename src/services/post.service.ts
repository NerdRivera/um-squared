import { PostRepository, type CreatePostInput, type UpdatePostInput } from "../repositories";
import { OrganizationRepository, UserRepository } from "../repositories";
import type { PostModel } from "../generated/prisma/models";
import { Role, FileType } from "../generated/prisma/enums";
import { ForbiddenError, NotFoundError } from "../utils";
import type { ActingUser } from "./role.service";

interface PostAttachmentPayload {
  fileName: string;
  fileUrl: string;
  fileType: FileType;
  fileSize: number;
  mimeType: string;
}

type PostWithAttachments = PostModel & {
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: FileType;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
  }>;
};

export interface CreatePostPayload extends CreatePostInput {
  attachments?: PostAttachmentPayload[];
}

export class PostService {
  constructor(
    private postRepository = new PostRepository(),
    private organizationRepository = new OrganizationRepository(),
    private userRepository = new UserRepository()
  ) {}

  private async canManagePost(actingUser: ActingUser, organizationId: string): Promise<boolean> {
    if (actingUser.role === Role.PLATFORM_ADMIN) {
      return true;
    }

    if (actingUser.role === Role.ORG_ADMIN || actingUser.role === Role.ORG_MEMBER) {
      const user = await this.userRepository.findById(actingUser.id);
      return user?.organizationId === organizationId;
    }

    return false;
  }

  async create(actingUser: ActingUser, input: CreatePostPayload): Promise<PostWithAttachments> {
    const organization = await this.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization", input.organizationId);
    }

    const canManage = await this.canManagePost(actingUser, input.organizationId);
    if (!canManage) {
      throw new ForbiddenError("You can only create posts for organizations you belong to");
    }

    const post = await this.postRepository.create({
      organizationId: input.organizationId,
      type: input.type,
      content: input.content,
      title: input.title,
      linkUrl: input.linkUrl,
      status: input.status,
      visibility: input.visibility,
    });

    if (input.attachments && input.attachments.length > 0) {
      await this.postRepository.createAttachments(
        input.attachments.map((attachment) => ({
          postId: post.id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
        }))
      );
    }

    return (await this.postRepository.findById(post.id)) as PostWithAttachments;
  }

  async getById(id: string): Promise<PostWithAttachments> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post", id);
    }
    return post;
  }

  async update(
    actingUser: ActingUser,
    id: string,
    input: UpdatePostInput,
    attachments?: PostAttachmentPayload[]
  ): Promise<PostWithAttachments> {
    const post = await this.getById(id);
    const canManage = await this.canManagePost(actingUser, post.organizationId);
    if (!canManage) {
      throw new ForbiddenError("You can only update posts for organizations you belong to");
    }

    const updatedPost = await this.postRepository.update(id, input);

    if (attachments !== undefined) {
      await this.postRepository.replaceAttachments(
        id,
        attachments.map((attachment) => ({
          postId: id,
          fileName: attachment.fileName,
          fileUrl: attachment.fileUrl,
          fileType: attachment.fileType,
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
        }))
      );
    }

    return (await this.postRepository.findById(id)) as PostWithAttachments;
  }

  async remove(actingUser: ActingUser, id: string): Promise<PostModel> {
    const post = await this.getById(id);
    const canManage = await this.canManagePost(actingUser, post.organizationId);
    if (!canManage) {
      throw new ForbiddenError("You can only delete posts for organizations you belong to");
    }

    return this.postRepository.delete(id);
  }
}
