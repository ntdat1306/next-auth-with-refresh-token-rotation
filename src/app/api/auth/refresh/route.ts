import { generateAccessToken, verifyAccessToken, verifyRefreshToken } from '@/lib/jwt';
import prisma from '@/lib/prismaClient';
import { JsonWebTokenError } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const req = await request.json();
    const { refreshToken } = req;

    if (!refreshToken)
        return NextResponse.json({ status: 'fail', data: {}, message: 'Require refresh token' }, { status: 404 });

    try {
        const refreshTokenDB = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

        if (!refreshTokenDB)
            return NextResponse.json(
                { status: 'fail', data: {}, message: 'Refresh token is not in DB' },
                { status: 404 }
            );

        // Try-catch to validate token
        try {
            const tokenVerify = verifyRefreshToken(refreshToken);
            const userId = tokenVerify.id;

            if (!userId)
                return NextResponse.json(
                    { status: 'fail', data: {}, message: 'Can not find `id` in payload of refresh token' },
                    { status: 404 }
                );

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user)
                return NextResponse.json(
                    { status: 'fail', data: {}, message: 'Can not find user in DB with refresh token' },
                    { status: 404 }
                );

            // Generate new access token
            const accessToken = generateAccessToken({ id: user.id });
            const accessTokenVerify = verifyAccessToken(accessToken);
            const expiresAt = accessTokenVerify.exp;

            if (!expiresAt)
                return NextResponse.json(
                    { status: 'fail', data: {}, message: 'Error when get `exp` of new access token' },
                    { status: 404 }
                );

            return NextResponse.json({
                status: 'success',
                data: { id: user.id, role: user.role, accessToken, expiresAt, refreshToken },
                message: 'Refresh access token success',
            });
        } catch (error) {
            // JWT error
            if (error instanceof JsonWebTokenError) {
                try {
                    await prisma.refreshToken.delete({ where: { id: refreshTokenDB.id } });
                } catch (error) {}
                return NextResponse.json({ status: 'fail', data: {}, message: error.message }, { status: 401 });
            }

            // Server error
            return NextResponse.json({ status: 'error', data: {}, message: 'Internal server error' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ status: 'error', data: {}, message: 'Internal server error' }, { status: 500 });
    }
}
