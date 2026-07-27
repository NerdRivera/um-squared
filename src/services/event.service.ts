import { EventRepository, type CreateEventInput, type UpdateEventInput, type RSVPInput } from "../repositories";
import { PostRepository, UserRepository } from "../repositories";
import { Role, RSVPStatus } from "../generated/prisma/enums";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils";
import type { ActingUser } from "./role.service";

export interface EventWithRsvps {
  id: string;
  postId: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  capacity: number | null;
  createdAt: Date;
  updatedAt: Date;
  rsvps: Array<{
    id: string;
    userId: string;
    status: RSVPStatus;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export class EventService {
  constructor(
    private eventRepository = new EventRepository(),
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

  async createForPost(actingUser: ActingUser, postId: string, input: CreateEventInput): Promise<EventWithRsvps> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post", postId);
    }

    const canManage = await this.canManagePost(actingUser, post.organizationId);
    if (!canManage) {
      throw new ForbiddenError("You can only manage events for organizations you belong to");
    }

    const existing = await this.eventRepository.findByPostId(postId);
    if (existing) {
      throw new ConflictError("This post already has an event attached");
    }

    const event = await this.eventRepository.create(postId, input);
    return {
      ...event,
      rsvps: [],
    } as EventWithRsvps;
  }

  async getById(eventId: string): Promise<EventWithRsvps> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event", eventId);
    }

    return event as EventWithRsvps;
  }

  async update(actingUser: ActingUser, eventId: string, input: UpdateEventInput): Promise<EventWithRsvps> {
    const event = await this.getById(eventId);
    const post = await this.postRepository.findById(event.postId);
    if (!post) {
      throw new NotFoundError("Post", event.postId);
    }

    const canManage = await this.canManagePost(actingUser, post.organizationId);
    if (!canManage) {
      throw new ForbiddenError("You can only update events for organizations you belong to");
    }

    const updated = await this.eventRepository.update(eventId, input);
    return {
      ...updated,
      rsvps: event.rsvps,
    } as EventWithRsvps;
  }

  async rsvp(actingUser: ActingUser, eventId: string, input: RSVPInput): Promise<EventWithRsvps> {
    const event = await this.getById(eventId);
    const existing = await this.eventRepository.findUserRsvp(eventId, actingUser.id);

    if (existing) {
      await this.eventRepository.updateRsvp(eventId, actingUser.id, input.status);
    } else {
      await this.eventRepository.createRsvp(eventId, actingUser.id, input.status);
    }

    return this.getById(eventId);
  }

  async listRsvps(eventId: string): Promise<Array<{ id: string; userId: string; status: RSVPStatus; createdAt: Date; updatedAt: Date }>> {
    const event = await this.getById(eventId);
    return this.eventRepository.listRsvps(eventId);
  }
}
