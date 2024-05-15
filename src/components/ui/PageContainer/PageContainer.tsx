'use client';
import React from 'react';
import styles from './PageContainer.module.scss';

interface PageContainerProps {
    children: React.ReactNode;
    center?: 'vertical' | 'horizontal' | 'both';
}

const PageContainer = (props: PageContainerProps) => {
    const { children, center = '' } = props;

    return <div className={`${styles.container} ${styles[center]}`}>{children}</div>;
};

export default PageContainer;
