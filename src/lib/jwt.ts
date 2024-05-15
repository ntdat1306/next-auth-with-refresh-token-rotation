import { RefreshToken, User } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const generateAccessToken = (data: { id: User['id'] }) => {
    return jwt.sign(data, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRED,
    });
};

export const generateRefreshToken = (data: { id: User['id'] }) => {
    return jwt.sign(data, process.env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.NEXT_PUBLIC_REFRESH_TOKEN_EXPIRED,
    });
};

export const verifyAccessToken = (token: RefreshToken['token']) => {
    return jwt.verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: RefreshToken['token']) => {
    return jwt.verify(token, process.env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET) as JwtPayload;
};
