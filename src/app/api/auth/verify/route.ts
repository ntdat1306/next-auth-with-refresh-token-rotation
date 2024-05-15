import { verifyAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prismaClient';
import { JsonWebTokenError } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const req = await request.json();
    const { accessToken } = req;

    if (!accessToken)
        return NextResponse.json(
            { status: 'fail', data: {}, message: 'Can not find `accessToken` to verify' },
            { status: 404 }
        );

    try {
        const accessTokenVerify = verifyAccessToken(accessToken);
        const userId = accessTokenVerify.id;

        if (!userId)
            return NextResponse.json(
                { status: 'fail', data: {}, message: 'Can not find `id` in payload of access token' },
                { status: 404 }
            );

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user)
            return NextResponse.json(
                { status: 'fail', data: {}, message: 'Can not find user in DB with access token' },
                { status: 404 }
            );

        return NextResponse.json({ status: 'success', data: user, message: 'Verify access token success' });
    } catch (error) {
        // JWT error
        if (error instanceof JsonWebTokenError)
            return NextResponse.json({ status: 'fail', data: {}, message: error.message }, { status: 401 });

        // Server error
        return NextResponse.json({ status: 'error', data: {}, message: 'Internal server error' }, { status: 500 });
    }
}
