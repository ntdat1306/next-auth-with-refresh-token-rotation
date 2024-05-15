'use client';

import React, { useState } from 'react';
import styles from './RegisterForm.module.scss';
import { Alert, Button, Card, Form, FormProps, Input, Radio } from 'antd';
import { signInSchema } from '@/lib/zod';
import { ZodError } from 'zod';
import { LucideLock, LucideUser } from '@/components/icon';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { Role } from '@prisma/client';
import axiosClient from '@/lib/axios';

type LoginFieldType = {
    username?: string;
    password?: string;
    role?: Role;
};

const RegisterForm = () => {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const onFinish: FormProps<LoginFieldType>['onFinish'] = async (values) => {
        try {
            // Destructuring value
            const { username, password, role } = values;

            setDisabled(true);
            setError('');
            setSuccess('');

            await axiosClient.post('/api/users', { username, password, role });
            setSuccess('Create user success, please login');
        } catch (error) {
            if (error instanceof AxiosError) setError(error.response?.data.message);
            else setError('Create user fail, try again');
        } finally {
            setDisabled(false);
        }
    };

    return (
        <Card className={styles.card}>
            <Form
                name='login'
                layout='vertical'
                onFinish={onFinish}
                initialValues={{ role: 'user' }}
                autoComplete='off'
            >
                {/* Username */}
                <Form.Item<LoginFieldType>
                    label='Username'
                    name='username'
                    rules={[
                        {
                            required: true,
                            validator(_, value) {
                                try {
                                    // Check empty value
                                    if (!value) return Promise.reject(new Error('Required'));

                                    signInSchema.shape.username.parse(value);
                                    return Promise.resolve();
                                } catch (error) {
                                    if (error instanceof ZodError)
                                        return Promise.reject(new Error(error.errors[0].message));
                                }
                            },
                        },
                    ]}
                >
                    <Input prefix={<LucideUser className={styles.icon} />} />
                </Form.Item>

                {/* Password */}
                <Form.Item<LoginFieldType>
                    label='Password'
                    name='password'
                    rules={[
                        {
                            required: true,
                            validator(_, value) {
                                try {
                                    // Check empty value
                                    if (!value) return Promise.reject(new Error('Required'));

                                    signInSchema.shape.password.parse(value);
                                    return Promise.resolve();
                                } catch (error) {
                                    if (error instanceof ZodError)
                                        return Promise.reject(new Error(error.errors[0].message));
                                }
                            },
                        },
                    ]}
                >
                    <Input.Password prefix={<LucideLock className={styles.icon} />} />
                </Form.Item>

                {/* Remember */}
                <Form.Item<LoginFieldType> name='role'>
                    <Radio.Group>
                        <Radio value='user'>user</Radio>
                        <Radio value='admin'>admin</Radio>
                    </Radio.Group>
                </Form.Item>

                {/* Error */}
                {error && (
                    <Form.Item>
                        <Alert message={error} type='error' showIcon />
                    </Form.Item>
                )}

                {/* Success */}
                {success && (
                    <Form.Item>
                        <Alert message={success} type='success' showIcon />
                    </Form.Item>
                )}

                {/* Submit */}
                <Form.Item className={styles.submit}>
                    <Button type='primary' htmlType='submit' disabled={disabled} className={styles.btn}>
                        Register
                    </Button>
                </Form.Item>

                {/* Login */}
                <Form.Item className={styles.lastItem}>
                    Or{' '}
                    <Link href='/login' className={styles.link}>
                        login now!
                    </Link>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default RegisterForm;
