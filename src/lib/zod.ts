import { z } from 'zod';

export const signInSchema = z.object({
    username: z.string(),
    password: z
        .string()
        .min(6, 'Password must be more than 6 characters')
        .max(32, 'Password must be less than 32 characters'),
});
