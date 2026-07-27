import { PollRepository, type CreatePollInput, type VoteInput, type UpdatePollSettingsInput } from "../repositories";
import { PostRepository, UserRepository } from "../repositories";
import type { PostModel } from "../generated/prisma/models";
import { Role, PostType } from "../generated/prisma/enums";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils";
import type { ActingUser } from "./role.service";

export interface PollWithDetails {
  id: string;
  question: string;
  singleChoice: boolean;
  allowVoteChange: boolean;
  hideResults: boolean;
  endsAt: Date | null;
  options: Array<{
    id: string;
    text: string;
    voteCount: number;
  }>;
  votes: Array<{
    userId: string;
    optionId: string;
  }>;
}

export class PollService {
  constructor(
    private pollRepository = new PollRepository(),
    private postRepository = new PostRepository(),
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

  async createForPost(actingUser: ActingUser, postId: string, input: CreatePollInput): Promise<PollWithDetails> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post", postId);
    }

    const canManage = await this.canManagePost(actingUser, post.organizationId);
    if (!canManage) {
      throw new ForbiddenError("You can only manage polls for organizations you belong to");
    }

    const existing = await this.pollRepository.findByPostId(postId);
    if (existing) {
      throw new ConflictError("This post already has a poll attached");
    }

    const poll = await this.pollRepository.create(postId, input);
    await this.pollRepository.createOptions(poll.id, input.options);

    return this.pollRepository.findById(poll.id) as Promise<PollWithDetails>;
  }

  async castVote(actingUser: ActingUser, pollId: string, optionIds: string[]): Promise<PollWithDetails> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new NotFoundError("Poll", pollId);
    }

    if (poll.singleChoice && optionIds.length > 1) {
      throw new ConflictError("This poll only allows one option to be selected");
    }

    const existingVote = await this.pollRepository.findUserVote(pollId, actingUser.id);
    if (existingVote && !poll.allowVoteChange) {
      throw new ConflictError("You have already voted in this poll");
    }

    if (existingVote && poll.allowVoteChange) {
      await this.pollRepository.deleteVote(pollId, actingUser.id);
    }

    await this.pollRepository.createVote(pollId, actingUser.id, optionIds);
    return this.pollRepository.findById(pollId) as Promise<PollWithDetails>;
  }

  async getResults(pollId: string): Promise<PollWithDetails> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new NotFoundError("Poll", pollId);
    }

    return poll as PollWithDetails;
  }

  async updateSettings(actingUser: ActingUser, pollId: string, input: UpdatePollSettingsInput): Promise<PollWithDetails> {
    const poll = await this.pollRepository.findById(pollId);
    if (!poll) {
      throw new NotFoundError("Poll", pollId);
    }

    const post = await this.postRepository.findById(poll.postId);
    if (!post) {
      throw new NotFoundError("Post", poll.postId);
    }

    const canManage = await this.canManagePost(actingUser, post.organizationId);
    if (!canManage) {
      throw new ForbiddenError("You can only manage polls for organizations you belong to");
    }

    const updatedPoll = await this.pollRepository.updateSettings(pollId, input);
    return {
      id: updatedPoll.id,
      question: updatedPoll.question,
      singleChoice: updatedPoll.singleChoice,
      allowVoteChange: updatedPoll.allowVoteChange,
      hideResults: updatedPoll.hideResults,
      endsAt: updatedPoll.endsAt,
      options: [],
      votes: [],
    };
  }
}
