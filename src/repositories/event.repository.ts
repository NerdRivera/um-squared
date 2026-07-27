import prisma from "../config/database";
import type { EventModel, EventRSVPModel } from "../generated/prisma/models";
import { RSVPStatus } from "../generated/prisma/enums";

export interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  capacity?: number | null;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  location?: string;
  startTime?: Date;
  endTime?: Date;
  capacity?: number | null;
}

export interface RSVPInput {
  status: RSVPStatus;
}

export class EventRepository {
  async findByPostId(postId: string): Promise<(EventModel & { rsvps: EventRSVPModel[] }) | null> {
    return prisma.event.findFirst({
      where: { postId },
      include: { rsvps: true },
    }) as Promise<(EventModel & { rsvps: EventRSVPModel[] }) | null>;
  }

  async findById(id: string): Promise<(EventModel & { rsvps: EventRSVPModel[] }) | null> {
    return prisma.event.findUnique({
      where: { id },
      include: { rsvps: true },
    }) as Promise<(EventModel & { rsvps: EventRSVPModel[] }) | null>;
  }

  async create(postId: string, input: CreateEventInput): Promise<EventModel> {
    return prisma.event.create({
      data: {
        postId,
        title: input.title,
        description: input.description,
        location: input.location,
        startTime: input.startTime,
        endTime: input.endTime,
        capacity: input.capacity ?? null,
      },
    });
  }

  async update(id: string, input: UpdateEventInput): Promise<EventModel> {
    return prisma.event.update({
      where: { id },
      data: input,
    });
  }

  async findUserRsvp(eventId: string, userId: string): Promise<EventRSVPModel | null> {
    return prisma.eventRSVP.findFirst({
      where: { eventId, userId },
    });
  }

  async createRsvp(eventId: string, userId: string, status: RSVPStatus): Promise<EventRSVPModel> {
    return prisma.eventRSVP.create({
      data: { eventId, userId, status },
    });
  }

  async updateRsvp(eventId: string, userId: string, status: RSVPStatus): Promise<EventRSVPModel> {
    return prisma.eventRSVP.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status },
    });
  }

  async listRsvps(eventId: string): Promise<EventRSVPModel[]> {
    return prisma.eventRSVP.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
  }
}
