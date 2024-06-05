import NextAuth, { NextAuthConfig, User } from 'next-auth';
import { signInSchema } from './zod';
import Credentials from 'next-auth/providers/credentials';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import axiosClient from './axios';

/**
 * * View docs here
 * ? https://github.com/nextauthjs/next-auth/discussions/2762
 * ? https://authjs.dev/guides/extending-the-session
 */
export const authOptions: NextAuthConfig = {
    providers: [
        Credentials({
            async authorize(credentials) {
                const rememberValue = credentials.remember + '';

                // Set secure cookies
                cookies().set('remember', rememberValue, {
                    httpOnly: true,
                    secure: true,
                    sameSite: true,
                });

                try {
                    // Validate
                    const result = signInSchema.safeParse(credentials);
                    if (!result.success) throw new Error(result.error + '');

                    const { username, password } = result.data;

                    // Login
                    const res = await axiosClient.post('/api/auth/login', {
                        username: username,
                        password: password,
                    });

                    const user = res.data;

                    // Must return id field to prevent error in this function
                    return user;
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        // async authorized(params) {
        //     // authorized only work if export default `auth` in middleware.ts file
        //     const {
        //         auth,
        //         request: { nextUrl },
        //     } = params;

        //     // Check if the user is authenticated
        //     const isLoggedIn = !!auth?.user;
        //     // Initialize protected routes
        //     // Here, all routes except pages in list is protected
        //     const isOnProtected = !['/login', '/register'].some((word) => nextUrl.pathname === word);

        //     if (isOnProtected) {
        //         if (isLoggedIn) return true;
        //         return false; // redirect to /login
        //     } else {
        //         if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        //         else return true;
        //     }
        // },
        async jwt(params) {
            const { token, user, trigger, session } = params;
            // Listen for `update` event
            if (trigger === 'update' && session?.user) {
                return {
                    ...token,
                    user: {
                        ...token.user,
                        id: session?.user.id,
                        role: session?.user.role,
                        accessToken: session?.user.accessToken,
                        refreshToken: session?.user.refreshToken,
                        accessTokenExpiresAt: session?.user.accessTokenExpiresAt,
                        refreshTokenExpiresAt: session?.user.refreshTokenExpiresAt,
                    },
                };
            }

            if (user) {
                // Save the access token and refresh token in the JWT on the initial login, as well as the user details
                token.user = user as any;
                return token;
            } else if (token.user && Date.now() < token.user.accessTokenExpiresAt * 1000) {
                // Subsequent logins, if the access token is still valid, return the JWT
                return token as any;
            } else {
                // Subsequent logins, if the access token has expired, try to refresh it
                if (!token.user?.refreshToken) throw new Error('Missing refresh token');

                try {
                    /**
                     * ! Can not use axios here, this cause error
                     * * Fetch promises only reject with a TypeError when a network error occurs.
                     * * Since 4xx and 5xx responses aren't network errors, there's nothing to catch.
                     * * You'll need to throw an error yourself to use Promise#catch
                     */
                    const res = await fetch(process.env.AUTH_URL + '/api/auth/refresh', {
                        method: 'POST',
                        body: JSON.stringify({ refreshToken: token.user.refreshToken }),
                    });
                    const resParse = await res.json();

                    if (resParse.status !== 'success') throw new Error(resParse.message);

                    return {
                        ...token,
                        user: {
                            ...token.user,
                            id: resParse.data.id,
                            role: resParse.data.role,
                            accessToken: resParse.data.accessToken,
                            refreshToken: resParse.data.refreshToken,
                            accessTokenExpiresAt: resParse.data.accessTokenExpiresAt,
                            refreshTokenExpiresAt: resParse.data.refreshTokenExpiresAt,
                        },
                    };
                } catch (error) {
                    // The error property can be used client-side to handle the refresh token error
                    return { ...token, error: 'RefreshAccessTokenError' as const };
                }
            }
        },
        async session(params) {
            const { session, token } = params;
            session.error = token.error;

            return {
                ...session,
                ...token,
            } as any;
        },
    },
    pages: {
        signIn: '/login',
    },
};

export const { auth, handlers, signIn, signOut } = NextAuth((req?: NextRequest) => {
    const cookieStore = cookies();
    const remember = cookieStore.get('remember');

    let maxAge = 30 * 24 * 60 * 60; // 30 days (default)
    if (remember && remember.value === 'true') {
        maxAge = 90 * 24 * 60 * 60; // 90 days
    }

    return { ...authOptions, session: { maxAge } };
});
