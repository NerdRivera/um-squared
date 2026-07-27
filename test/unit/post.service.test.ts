import { describe, it, expect, vi } from "vitest";
import { PostService } from "../../src/services/post.service";
import { ForbiddenError } from "../../src/utils";
import { Role, PostType, PostStatus, PostVisibility } from "../../src/generated/prisma/enums";

describe("PostService", () => {
  it("creates a post for a user who belongs to the target organization", async () => {
    const repo = {
      create: vi.fn().mockResolvedValue({
        id: "post-1",
        organizationId: "org-1",
        type: PostType.TEXT,
        content: "Hello world",
        title: "Hello",
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findById: vi.fn().mockResolvedValue({
        id: "post-1",
        organizationId: "org-1",
        type: PostType.TEXT,
        content: "Hello world",
        title: "Hello",
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [{ id: "attachment-1", fileName: "hello.png" }],
      }),
      createAttachments: vi.fn().mockResolvedValue([]),
      replaceAttachments: vi.fn().mockResolvedValue([]),
    };

    const organizationRepo = {
      findById: vi.fn().mockResolvedValue({ id: "org-1" }),
    };

    const userRepo = {
      findById: vi.fn().mockResolvedValue({ id: "user-1", organizationId: "org-1" }),
    };

    const service = new PostService(repo as any, organizationRepo as any, userRepo as any);

    const post = await service.create(
      { id: "user-1", email: "user@example.com", role: Role.ORG_ADMIN },
      {
        organizationId: "org-1",
        type: PostType.TEXT,
        content: "Hello world",
        title: "Hello",
      }
    );

    expect(repo.create).toHaveBeenCalled();
    expect(post.id).toBe("post-1");
    expect(post.attachments).toHaveLength(1);
  });

  it("rejects creating posts for organizations the user does not belong to", async () => {
    const repo = {
      create: vi.fn(),
      findById: vi.fn(),
      createAttachments: vi.fn(),
      replaceAttachments: vi.fn(),
    };

    const organizationRepo = {
      findById: vi.fn().mockResolvedValue({ id: "org-1" }),
    };

    const userRepo = {
      findById: vi.fn().mockResolvedValue({ id: "user-1", organizationId: "org-2" }),
    };

    const service = new PostService(repo as any, organizationRepo as any, userRepo as any);

    await expect(
      service.create(
        { id: "user-1", email: "user@example.com", role: Role.ORG_MEMBER },
        {
          organizationId: "org-1",
          type: PostType.TEXT,
          content: "Hello world",
        }
      )
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("replaces attachments when updating a post with new uploads", async () => {
    const repo = {
      create: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "post-1",
        organizationId: "org-1",
        type: PostType.TEXT,
        content: "Hello world",
        title: "Hello",
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      update: vi.fn().mockResolvedValue({
        id: "post-1",
        organizationId: "org-1",
        type: PostType.TEXT,
        content: "Updated",
        title: "Updated",
        status: PostStatus.PUBLISHED,
        visibility: PostVisibility.PUBLIC,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [{ id: "attachment-2", fileName: "updated.png" }],
      }),
      createAttachments: vi.fn().mockResolvedValue([]),
      replaceAttachments: vi.fn().mockResolvedValue([]),
    };

    const organizationRepo = {
      findById: vi.fn().mockResolvedValue({ id: "org-1" }),
    };

    const userRepo = {
      findById: vi.fn().mockResolvedValue({ id: "user-1", organizationId: "org-1" }),
    };

    const service = new PostService(repo as any, organizationRepo as any, userRepo as any);

    await service.update(
      { id: "user-1", email: "user@example.com", role: Role.ORG_ADMIN },
      "post-1",
      { content: "Updated" },
      [{ fileName: "updated.png", fileUrl: "/static/uploads/updated.png", fileType: "IMAGE" as any, fileSize: 123, mimeType: "image/png" }]
    );

    expect(repo.replaceAttachments).toHaveBeenCalledWith("post-1", expect.any(Array));
  });
});
