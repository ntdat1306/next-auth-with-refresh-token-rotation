'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SessionProvider } from 'next-auth/react';
import { App as AntdApp } from 'antd';
import { ConfigOptions as MessageConfig } from 'antd/es/message/interface';
import TokenProvider from './TokenProvider';
import AxiosProvider from './AxiosProvider';

interface RootProviderProps {
    children: React.ReactNode;
}

const RootProvider = (props: RootProviderProps) => {
    const { children } = props;

    // Message config in Antd
    const messageConfig: MessageConfig = {
        duration: 2,
        maxCount: 1,
    };

    return (
        <AntdRegistry>
            <AntdApp message={messageConfig}>
                <SessionProvider>
                    <TokenProvider>
                        <AxiosProvider>{children}</AxiosProvider>
                    </TokenProvider>
                </SessionProvider>
            </AntdApp>
        </AntdRegistry>
    );
};

export default RootProvider;
