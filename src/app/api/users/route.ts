import withMiddleware, { RouterHandler } from '@/hocs/withMiddleware';
import prisma from '@/lib/prismaClient';
import { NextRequest, NextResponse } from 'next/server';
import authMiddleware from '../_middleware/authMiddleware';

const getUsers: RouterHandler = async (request) => {
    const user = request.middlewareData?.user;

    if (!user) {
        return NextResponse.json(
            { status: 'fail', data: {}, message: 'Can not find `user` in middleware data' },
            { status: 404 }
        );
    }

    if (user.role === 'admin') {
        const resData = await prisma.user.findMany({});
        return NextResponse.json({ status: 'success', data: resData, message: 'Get all users success' });
    } else if (user.role === 'user') {
        const resData = await prisma.user.findMany({
            where: {
                role: 'user',
            },
        });
        return NextResponse.json({ status: 'success', data: resData, message: 'Get users success' });
    } else {
        return NextResponse.json(
            { status: 'fail', data: {}, message: 'The `role` of user is invalid' },
            { status: 403 }
        );
    }
};

// Get all user
export const GET = withMiddleware(getUsers)([authMiddleware]);

// Create new user
export async function POST(request: NextRequest) {
    const req = await request.json();
    const { username, password, role } = req;

    try {
        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        if (user)
            return NextResponse.json(
                { status: 'fail', data: {}, message: 'Username has already been taken' },
                { status: 404 }
            );

        await prisma.user.create({
            data: { username, password, role },
        });

        return NextResponse.json({ status: 'success', data: {}, message: 'Create user success' });
    } catch (error) {
        return NextResponse.json({ status: 'error', data: {}, message: 'Internal server error' }, { status: 500 });
    }
}
