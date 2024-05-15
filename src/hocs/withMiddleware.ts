import { NextRequest, NextResponse } from 'next/server';

interface NextRequestExtend extends NextRequest {
    middlewareData: any;
}

export type NextFunction = () => void;
export type Middleware = (request: NextRequestExtend, next: NextFunction) => Promise<NextResponse | void>;
export type RouterHandler = (request: NextRequestExtend) => Promise<NextResponse>;

// Type requires at least one element
type NonEmptyArray<T> = [T, ...T[]];

const withMiddleware = (routerHandler: RouterHandler) => {
    return (middlewares: NonEmptyArray<Middleware>) => {
        return async (request: NextRequestExtend) => {
            // Loop through each middleware
            for (const middleware of middlewares) {
                let nextInvoked = false;

                const next = async () => {
                    nextInvoked = true;
                };

                const result = await middleware(request, next);

                if (!nextInvoked) return result;
            }

            return routerHandler(request);
        };
    };
};

export default withMiddleware;
