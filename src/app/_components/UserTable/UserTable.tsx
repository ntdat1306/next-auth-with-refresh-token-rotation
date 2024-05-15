'use client';

import useAxiosAuth from '@/hooks/useAxiosAuth';
import { User } from '@prisma/client';
import { App as AntdApp, Button, Card, Table, TableProps, Tag } from 'antd';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';

interface DataType extends User {
    key: string;
}

const columns: TableProps<DataType>['columns'] = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
    },
    {
        title: 'Password',
        dataIndex: 'password',
        key: 'password',
    },
    {
        title: 'Role',
        key: 'role',
        dataIndex: 'role',
        render: (_, record) => <Tag color={record.role === 'admin' ? 'success' : 'warning'}>{record.role}</Tag>,
    },
    {
        title: 'Created At',
        dataIndex: 'createdAt',
        key: 'createdAt',
    },
    {
        title: 'Updated At',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
    },
];

const UserTable = () => {
    const axiosAuth = useAxiosAuth();
    const { message } = AntdApp.useApp();
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);

    const data = users.map((user) => ({
        key: user.id,
        id: user.id,
        username: user.username,
        password: user.password,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    }));

    const handleGetUsers = async () => {
        try {
            const res = await axiosAuth.get('/api/users');
            setUsers(res.data);
        } catch (error) {
            if (error instanceof AxiosError) message.error(error.response?.data.message);
        }
    };

    if (!session) return null;

    return (
        <Card title="Table">
            <Button onClick={handleGetUsers}>{session?.user?.role === 'user' ? 'Get users' : 'Get all users'}</Button>
            <Table columns={columns} dataSource={data} />
        </Card>
    );
};

export default UserTable;
