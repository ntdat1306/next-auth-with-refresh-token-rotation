'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const deleteCookies = async () => {
    // Delete all cookies contain `authjs` text
    cookies()
        .getAll()
        .map((item) => item.name)
        .filter((item) => item.includes('authjs'))
        .forEach((item) => {
            cookies().delete(item);
        });

    redirect('/login');
};
