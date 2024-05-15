'use client';

import React, { useState } from 'react';
import styles from './LoginForm.module.scss';
import { Alert, Button, Card, Checkbox, Form, FormProps, Input } from 'antd';
import { signIn } from 'next-auth/react';
import { signInSchema } from '@/lib/zod';
import { ZodError } from 'zod';
import { LucideLock, LucideUser } from '@/components/icon';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type LoginFieldType = {
    username?: string;
    password?: string;
    remember?: string;
};

const LoginForm = () => {
    const [disabled, setDisabled] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const router = useRouter();

    const onFinish: FormProps<LoginFieldType>['onFinish'] = async (values) => {
        // Destructuring value
        const { username, password, remember } = values;

        setDisabled(true);
        setError('');

        /**
         * * Use `signIn` in `next-auth/react` to prevent wrong session
         * ? If use `signIn` in `@/lib/auth` like document will return old session, not new session
         */
        const res = await signIn('credentials', {
            username,
            password,
            remember,
            callbackUrl: '/',
            redirect: false,
        });

        setDisabled(false);

        // Check response
        if (res?.error) setError('Username or password is incorrect');
        else router.push('/');
    };

    return (
        <Card className={styles.card}>
            <Form
                name='login'
                layout='vertical'
                onFinish={onFinish}
                initialValues={{ remember: true }}
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
                    <Input placeholder='admin' prefix={<LucideUser className={styles.icon} />} />
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
                    <Input.Password placeholder='123456789' prefix={<LucideLock className={styles.icon} />} />
                </Form.Item>

                {/* Remember */}
                <Form.Item<LoginFieldType> name='remember' valuePropName='checked'>
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                {error && (
                    <Form.Item>
                        <Alert message={error} type='error' showIcon />
                    </Form.Item>
                )}

                {/* Submit */}
                <Form.Item className={styles.submit}>
                    <Button type='primary' htmlType='submit' disabled={disabled} className={styles.btn}>
                        Login
                    </Button>
                </Form.Item>

                {/* Register */}
                <Form.Item className={styles.lastItem}>
                    Or{' '}
                    <Link href='/register' className={styles.link}>
                        register now!
                    </Link>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default LoginForm;
