import prisma from '@/lib/prismaClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const req = await request.json();
    const { refreshToken } = req;

    try {
        if (!refreshToken) {
            return NextResponse.json({ status: 'fail', data: {}, message: 'Require refresh token' }, { status: 404 });
        }

        const refreshTokenDB = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

        if (!refreshTokenDB) {
            return NextResponse.json(
                { status: 'fail', data: {}, message: 'Refresh token is not in DB' },
                { status: 404 }
            );
        }

        await prisma.refreshToken.delete({ where: { id: refreshTokenDB.id } });

        return NextResponse.json({ status: 'success', data: {}, message: 'Logout success' });
    } catch (error) {
        return NextResponse.json({ status: 'error', data: {}, message: 'Internal server error' }, { status: 500 });
    }
}
