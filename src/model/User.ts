export type User = RegularUser | AdminUser | OrganizationUser;
export interface RegisteredUser {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    role: 'user' | 'admin' | 'organization';
}
export interface RegularUser extends RegisteredUser {
    role: 'user';
}

export interface AdminUser extends RegisteredUser {
    role: 'admin';
}

export interface OrganizationUser extends RegisteredUser {
    role: 'organization';
    organizationId: string;
}