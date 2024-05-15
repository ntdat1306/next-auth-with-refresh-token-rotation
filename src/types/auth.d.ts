import { Role } from '@prisma/client';
import NextAuth, { type DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

interface UserType {
    id: string;
    role: Role;
    accessToken: string;
    expiresAt: number;
    refreshToken: string;
}

declare module 'next-auth' {
    interface User extends UserType {}

    interface Session {
        user?: UserType;
        error?: 'RefreshAccessTokenError';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        user?: UserType;
        error?: 'RefreshAccessTokenError';
    }
}
