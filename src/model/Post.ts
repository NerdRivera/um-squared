import { Attachment } from './Attachment';

export interface Post {
    id: string;
    title: string;
    content: string;
    ownerId: string;
    attachments?: Attachment[];
}