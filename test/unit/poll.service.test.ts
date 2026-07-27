import { describe, it, expect, vi } from "vitest";
import { PollService } from "../../src/services/poll.service";
import { ConflictError } from "../../src/utils";
import { Role } from "../../src/generated/prisma/enums";

describe("PollService", () => {
  it("creates a poll and its options for an organization admin", async () => {
    const pollRepo = {
      findByPostId: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "poll-1", question: "What is your favorite color?" }),
      createOptions: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue({
        id: "poll-1",
        question: "What is your favorite color?",
        singleChoice: true,
        allowVoteChange: false,
        hideResults: false,
        endsAt: null,
        options: [],
        votes: [],
      }),
      findUserVote: vi.fn().mockResolvedValue(null),
      createVote: vi.fn().mockResolvedValue({ id: "vote-1" }),
      updateOptionVoteCounts: vi.fn().mockResolvedValue([]),
      updateSettings: vi.fn().mockResolvedValue({ id: "poll-1" }),
    };

    const postRepo = {
      findById: vi.fn().mockResolvedValue({ id: "post-1", organizationId: "org-1" }),
    };

    const userRepo = {
      findById: vi.fn().mockResolvedValue({ id: "user-1", organizationId: "org-1" }),
    };

    const service = new PollService(pollRepo as any, postRepo as any, userRepo as any);

    const poll = await service.createForPost(
      { id: "user-1", email: "user@example.com", role: Role.ORG_ADMIN },
      "post-1",
      {
        question: "What is your favorite color?",
        options: ["Red", "Blue"],
        singleChoice: true,
        allowVoteChange: false,
        hideResults: false,
      }
    );

    expect(pollRepo.create).toHaveBeenCalled();
    expect(pollRepo.createOptions).toHaveBeenCalledWith("poll-1", expect.any(Array));
    expect(poll.id).toBe("poll-1");
  });

  it("rejects a second vote when vote changes are not allowed", async () => {
    const pollRepo = {
      findByPostId: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      createOptions: vi.fn(),
      findById: vi.fn().mockResolvedValue({
        id: "poll-1",
        question: "Pick one",
        singleChoice: true,
        allowVoteChange: false,
        hideResults: false,
        endsAt: null,
        options: [{ id: "option-1", text: "One", voteCount: 1 }],
        votes: [{ userId: "user-1", optionId: "option-1" }],
      }),
      findUserVote: vi.fn().mockResolvedValue({ optionId: "option-1" }),
      createVote: vi.fn(),
      updateOptionVoteCounts: vi.fn(),
      updateSettings: vi.fn(),
    };

    const postRepo = {
      findById: vi.fn(),
    };

    const userRepo = {
      findById: vi.fn(),
    };

    const service = new PollService(pollRepo as any, postRepo as any, userRepo as any);

    await expect(
      service.castVote(
        { id: "user-1", email: "user@example.com", role: Role.STUDENT },
        "poll-1",
        ["option-1"]
      )
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
