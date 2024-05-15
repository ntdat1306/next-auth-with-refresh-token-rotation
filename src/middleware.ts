import NextAuth from 'next-auth';
import { authOptions } from './lib/auth';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authOptions);

// export default auth;

export default auth((req) => {
    const { auth, nextUrl } = req;
    // Check if the user is authenticated
    const isLoggedIn = !!auth?.user;

    /**
     * Initialize protected routes
     * Here, all routes except pages in list is protected
     */
    const isOnProtected = !['/login', '/register'].some((word) => nextUrl.pathname === word);

    // Check conditions
    if (isOnProtected) {
        if (isLoggedIn) return NextResponse.next();
        return NextResponse.redirect(new URL('/login', nextUrl));
    } else {
        if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
        else return NextResponse.next();
    }
});

export const config = {
    /**
     * * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * ? https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
     */
    //
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
