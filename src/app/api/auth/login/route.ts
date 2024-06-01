import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import prisma from '@/lib/prismaClient';
import { signInSchema } from '@/lib/zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const req = await request.json();

    try {
        // Validate
        const result = signInSchema.safeParse(req);
        if (!result.success) {
            return NextResponse.json(
                { status: 'fail', data: {}, message: result.error.errors[0].message },
                { status: 400 }
            );
        }

        // Destructuring data if result success
        const { username, password } = result.data;

        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        if (!user || user.password !== password) {
            return NextResponse.json(
                { status: 'fail', data: {}, message: 'Can not find user or password wrong' },
                { status: 404 }
            );
        }

        // Create token
        const accessToken = generateAccessToken({ id: user.id });
        const refreshToken = generateRefreshToken({ id: user.id });

        const accessTokenVerify = verifyAccessToken(accessToken);
        const refreshTokenVerify = verifyRefreshToken(refreshToken);

        const accessTokenExpiresAt = accessTokenVerify.exp;
        const refreshTokenExpiresAt = refreshTokenVerify.exp;

        if (!accessTokenExpiresAt || !refreshTokenExpiresAt) {
            return NextResponse.json(
                { status: 'fail', data: {}, message: 'Error when get `exp` of access token or refresh token' },
                { status: 404 }
            );
        }

        // Add refresh token to DB
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                expiresAt: refreshTokenExpiresAt,
                userId: user.id,
            },
        });

        // Remove all refresh token expired
        await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lte: Date.now() / 1000,
                },
                userId: user.id,
            },
        });

        return NextResponse.json({
            status: 'success',
            data: {
                id: user.id,
                role: user.role,
                accessToken,
                refreshToken,
                accessTokenExpiresAt,
                refreshTokenExpiresAt,
            },
            message: 'Login success',
        });
    } catch (error) {
        return NextResponse.json({ status: 'error', data: {}, message: 'Internal server error' }, { status: 500 });
    }
}
