export interface RegisteredUser {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AdminUser extends RegisteredUser {
    role: 'admin';
}

