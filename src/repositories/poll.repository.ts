import prisma from "../config/database";
import type { PollModel, PollOptionModel, PollVoteModel } from "../generated/prisma/models";
import { PostType } from "../generated/prisma/enums";

export interface CreatePollInput {
  question: string;
  options: string[];
  singleChoice?: boolean;
  allowVoteChange?: boolean;
  hideResults?: boolean;
  endsAt?: Date | null;
}

export interface VoteInput {
  optionIds: string[];
}

export interface UpdatePollSettingsInput {
  singleChoice?: boolean;
  allowVoteChange?: boolean;
  hideResults?: boolean;
  endsAt?: Date | null;
}

export class PollRepository {
  async findByPostId(postId: string): Promise<(PollModel & { options: PollOptionModel[]; votes: PollVoteModel[] }) | null> {
    return prisma.poll.findFirst({
      where: { postId },
      include: { options: true, votes: true },
    }) as Promise<(PollModel & { options: PollOptionModel[]; votes: PollVoteModel[] }) | null>;
  }

  async findById(id: string): Promise<(PollModel & { options: PollOptionModel[]; votes: PollVoteModel[] }) | null> {
    return prisma.poll.findUnique({
      where: { id },
      include: { options: true, votes: true },
    }) as Promise<(PollModel & { options: PollOptionModel[]; votes: PollVoteModel[] }) | null>;
  }

  async create(postId: string, input: CreatePollInput): Promise<PollModel> {
    return prisma.poll.create({
      data: {
        postId,
        question: input.question,
        singleChoice: input.singleChoice ?? true,
        allowVoteChange: input.allowVoteChange ?? false,
        hideResults: input.hideResults ?? false,
        endsAt: input.endsAt ?? null,
      },
    });
  }

  async createOptions(pollId: string, options: string[]): Promise<PollOptionModel[]> {
    if (options.length === 0) {
      return [];
    }

    return prisma.pollOption.createManyAndReturn({
      data: options.map((text) => ({ pollId, text })),
    });
  }

  async findUserVote(pollId: string, userId: string): Promise<PollVoteModel | null> {
    return prisma.pollVote.findFirst({
      where: { pollId, userId },
    });
  }

  async createVote(pollId: string, userId: string, optionIds: string[]): Promise<PollVoteModel[]> {
    if (optionIds.length === 0) {
      return [];
    }

    const createdVotes = await prisma.$transaction(async (tx) => {
      const votes: PollVoteModel[] = [];
      for (const optionId of optionIds) {
        const vote = await tx.pollVote.create({
          data: { pollId, optionId, userId },
        });
        votes.push(vote as PollVoteModel);
      }
      return votes;
    });

    await prisma.pollOption.updateMany({
      where: { id: { in: optionIds } },
      data: { voteCount: { increment: 1 } },
    });

    return createdVotes;
  }

  async deleteVote(pollId: string, userId: string): Promise<void> {
    const existingVote = await prisma.pollVote.findFirst({ where: { pollId, userId } });
    if (!existingVote) {
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.pollVote.deleteMany({ where: { pollId, userId } });
      await tx.pollOption.update({
        where: { id: existingVote.optionId },
        data: { voteCount: { decrement: 1 } },
      });
    });
  }

  async updateSettings(pollId: string, input: UpdatePollSettingsInput): Promise<PollModel> {
    return prisma.poll.update({
      where: { id: pollId },
      data: {
        singleChoice: input.singleChoice,
        allowVoteChange: input.allowVoteChange,
        hideResults: input.hideResults,
        endsAt: input.endsAt,
      },
    });
  }
}
