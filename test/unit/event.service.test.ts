import { describe, it, expect, vi } from "vitest";
import { EventService } from "../../src/services/event.service";
import { ConflictError } from "../../src/utils";
import { Role, RSVPStatus } from "../../src/generated/prisma/enums";

describe("EventService", () => {
  it("creates an event for an organization admin", async () => {
    const eventRepo = {
      findByPostId: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "event-1", postId: "post-1", title: "Meetup", description: "Desc", location: "Campus", startTime: new Date(), endTime: new Date(), capacity: 10, createdAt: new Date(), updatedAt: new Date() }),
      findById: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      findUserRsvp: vi.fn(),
      createRsvp: vi.fn(),
      updateRsvp: vi.fn(),
      listRsvps: vi.fn(),
    };

    const postRepo = {
      findById: vi.fn().mockResolvedValue({ id: "post-1", organizationId: "org-1" }),
    };

    const userRepo = {
      findById: vi.fn().mockResolvedValue({ id: "user-1", organizationId: "org-1" }),
    };

    const service = new EventService(eventRepo as any, postRepo as any, userRepo as any);

    const event = await service.createForPost(
      { id: "user-1", email: "user@example.com", role: Role.ORG_ADMIN },
      "post-1",
      {
        title: "Meetup",
        description: "Desc",
        location: "Campus",
        startTime: new Date(),
        endTime: new Date(),
        capacity: 10,
      }
    );

    expect(eventRepo.create).toHaveBeenCalled();
    expect(event.id).toBe("event-1");
  });

  it("rejects duplicate event creation on the same post", async () => {
    const eventRepo = {
      findByPostId: vi.fn().mockResolvedValue({ id: "event-1" }),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      findUserRsvp: vi.fn(),
      createRsvp: vi.fn(),
      updateRsvp: vi.fn(),
      listRsvps: vi.fn(),
    };

    const postRepo = {
      findById: vi.fn().mockResolvedValue({ id: "post-1", organizationId: "org-1" }),
    };

    const userRepo = {
      findById: vi.fn().mockResolvedValue({ id: "user-1", organizationId: "org-1" }),
    };

    const service = new EventService(eventRepo as any, postRepo as any, userRepo as any);

    await expect(
      service.createForPost(
        { id: "user-1", email: "user@example.com", role: Role.ORG_ADMIN },
        "post-1",
        {
          title: "Meetup",
          description: "Desc",
          location: "Campus",
          startTime: new Date(),
          endTime: new Date(),
        }
      )
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
