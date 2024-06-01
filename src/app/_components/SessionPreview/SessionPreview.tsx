'use client';

import axiosClient from '@/lib/axios';
import { App as AntdApp, Button, Typography, Statistic, Card } from 'antd';
import { AxiosError } from 'axios';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

const { Countdown } = Statistic;

const SessionPreview = () => {
    const { message } = AntdApp.useApp();
    const { data: session } = useSession();
    const refreshTime = session?.user && session?.user.accessTokenExpiresAt * 1000;
    const refreshTokenExpiresAt = session?.user && session?.user.refreshTokenExpiresAt * 1000;

    const handleLogOut = async () => {
        try {
            message.success('Logout success');
            await axiosClient.post('/api/auth/logout', { refreshToken: session?.user?.refreshToken });
        } catch (error) {
            if (error instanceof AxiosError) message.error(error.response?.data.message);
        }
        await signOut();
    };

    if (!session) return null;

    return (
        <Card title='Session'>
            <Button type='primary' onClick={handleLogOut}>
                Sign out
            </Button>
            <Typography>
                <pre>{JSON.stringify(session, null, 2)}</pre>
            </Typography>
            <Countdown title='Access token will refresh in' value={refreshTime} />
            <Countdown title='Refresh token will expired in' value={refreshTokenExpiresAt} />
        </Card>
    );
};

export default SessionPreview;
