'use client';

import axiosClient from '@/lib/axios';
import { deleteCookies } from '@/server/deleteCookies';
import { App } from 'antd';
import { AxiosError } from 'axios';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

interface TokenProviderProps {
    children: React.ReactNode;
}

const TokenProvider = (props: TokenProviderProps) => {
    const { children } = props;
    const { message } = App.useApp();
    const { data: session, update } = useSession();
    const [isFirstMounted, setIsFirstMounted] = useState<boolean>(true);

    // Set refresh time shorten than token expired 10%
    const refreshTime = Number(process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRED.replace(/\D/g, '')) * 1000 * (90 / 100);

    // Auto logout when refresh token expired
    useEffect(() => {
        if (session?.error === 'RefreshAccessTokenError') {
            message.loading('Logging out');
            setTimeout(deleteCookies, 1000);
        }
    }, [session?.error, message]);

    // Auto refresh token after interval
    useEffect(() => {
        const updateAccessToken = async () => {
            try {
                const res = await axiosClient.post('/api/auth/refresh', {
                    refreshToken: session?.user?.refreshToken,
                });
                await update({ user: res.data });
            } catch (error) {
                if (error instanceof AxiosError) {
                    message.loading('Refresh token expired, logging out');
                    setTimeout(signOut, 1000);
                }
            } finally {
                if (isFirstMounted) {
                    setIsFirstMounted(false);
                }
            }
        };

        if (session) {
            // Check if first render
            if (isFirstMounted) {
                updateAccessToken();
            }

            // Keep checking after atime
            const timer = setInterval(updateAccessToken, refreshTime);

            // Clean up
            return () => clearInterval(timer);
        }
    }, [session, refreshTime, isFirstMounted, message, update]);

    return <>{children}</>;
};

export default TokenProvider;
