import { PageContainer } from '@/components/ui/PageContainer';
import React from 'react';
import { SessionPreview } from './_components/SessionPreview';
import { UserTable } from './_components/UserTable';

const Home = () => {
    return (
        <PageContainer>
            <SessionPreview />
            <UserTable />
        </PageContainer>
    );
};

export default Home;
