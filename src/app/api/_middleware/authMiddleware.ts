import { Middleware } from '@/hocs/withMiddleware';
import axiosClient from '@/lib/axios';
import { AxiosError } from 'axios';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const authMiddleware: Middleware = async (request, next) => {
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    // Check if `authorization` not exist
    if (!authHeader) {
        return NextResponse.json(
            { status: 'fail', data: {}, message: 'Can not find `authorization` header' },
            { status: 404 }
        );
    }

    // Check if `authorization` start with `Bearer`
    if (authHeader.startsWith('Bearer ')) {
        try {
            const accessToken = authHeader.substring(7, authHeader.length);

            // Call verify API
            const res = await axiosClient.post('/api/auth/verify', { accessToken });
            const user = res.data;

            // Pass custom data to next request
            // Call `next` function to return early and continue routing
            if (user) {
                request.middlewareData = { user };
                return next();
            }
        } catch (error) {
            // Axios error
            if (error instanceof AxiosError)
                return NextResponse.json(error.response?.data, { status: error.response?.status });

            // Server error
            return NextResponse.json({ status: 'error', data: {}, message: 'Internal server error' }, { status: 500 });
        }
    } else {
        return NextResponse.json(
            { status: 'fail', data: {}, message: '`authorization` header must start with Bearer' },
            { status: 400 }
        );
    }
};

export default authMiddleware;
