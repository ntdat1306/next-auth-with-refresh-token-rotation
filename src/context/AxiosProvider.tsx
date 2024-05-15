import { axiosAuth } from '@/lib/axios';
import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useSession } from 'next-auth/react';
import React, { createContext, useEffect } from 'react';

interface AxiosProviderProps {
    children: React.ReactNode;
}

interface AxiosContextType {
    axiosAuth: AxiosInstance;
}

interface AxiosRequestConfig extends InternalAxiosRequestConfig {
    retry: boolean;
}

export const AxiosContext = createContext<AxiosContextType>(null!);

const AxiosProvider = (props: AxiosProviderProps) => {
    const { children } = props;
    const { data: session, update } = useSession();

    useEffect(() => {
        const requestIntercept = axiosAuth.interceptors.request.use((config) => {
            if (!config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${session?.user?.accessToken}`;
            }
            return config;
        });

        // const responseIntercept = axiosAuth.interceptors.response.use(
        //     (response) => response,
        //     async (error) => {
        //         if (error instanceof AxiosError) {
        //             const prevRequest = error.config as AxiosRequestConfig;

        //             // If the error message is `jwt expired` and there is no originalRequest.retry flag,
        //             // it means the token has expired and we need to refresh it
        //             if (error.response?.data.message === 'jwt expired' && !prevRequest.retry) {
        //                 prevRequest.retry = true;
        //             }

        //             try {
        //                 await update();
        //                 prevRequest.headers['Authorization'] = `Bearer ${session?.user?.accessToken}`;
        //                 return axiosAuth(prevRequest);
        //             } catch (error) {
        //                 // Handle refresh token error or redirect to login
        //             }
        //         }
        //         return Promise.reject(error);
        //     }
        // );

        // Clean up
        return () => {
            axiosAuth.interceptors.request.eject(requestIntercept);
            // axiosAuth.interceptors.response.eject(responseIntercept);
        };
    }, [session, update]);

    const value = { axiosAuth };

    return <AxiosContext.Provider value={value}>{children}</AxiosContext.Provider>;
};

export default AxiosProvider;
