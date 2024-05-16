<p align="center">
  <a href="https://nextjs.org">
    <picture>
      <img src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" height="128">
    </picture>
  </a>
  <a href="https://nextjs.org">
    <picture>
      <img src="https://authjs.dev/img/logo-sm.png" height="128">
    </picture>
  </a>
  <h1 align="center">Next.js + Auth.js with refresh token rotation</h1>
</p>

<p align="center">
  <a aria-label="NextJS" href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">
  </a>
  <a aria-label="JWT" href="https://jwt.io/">
    <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white">
  </a>
  <a aria-label="MySQL" href="https://www.mysql.com/">
    <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white">
  </a>
  <a aria-label="Prisma" href="https://www.prisma.io/">
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white">
  </a>
  <a aria-label="Ant Design" href="https://ant.design/">
    <img src="https://img.shields.io/badge/Ant%20Design-1890FF?style=for-the-badge&logo=antdesign&logoColor=white">
  </a>
  <a aria-label="Axios" href="https://axios-http.com/">
    <img src="https://img.shields.io/badge/axios-671ddf?&style=for-the-badge&logo=axios&logoColor=white">
  </a>
</p>

## 🌵 Workflow

<img src="./src/assets/workflow/workflow.png">

## 🌵 How to use

```bash
# Clone this repository
$ git clone https://link-to-project

# Go into the repository
$ cd next-auth-with-refresh-token-rotation

# Install dependencies
$ yarn

# Run the app
$ yarn dev
```

> [!NOTE]
> You must set everything up as instructed below to run this project

## 🌵 Setup

### MySQL

Create database name `demo_next_auth`

### Prisma

```bash
# Map Prisma model with database
$ npx prisma db push

# Generate Prisma client
$ npx prisma generate
```

### Secret

```bash
# Generate AUTH_SECRET
$ openssl rand -base64 32

# Generate TOKEN_SECRET
$ node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment (.env)

```bash
# This is demo
DATABASE_URL="mysql://username:password@localhost:3306/demo_next_auth"
AUTH_URL="http://localhost:3000"
AUTH_SECRET="7a0c17d861479ca5dcf82bc52e64ebff1724212739083d797e2b9d9f07dc8561"
NEXT_PUBLIC_ACCESS_TOKEN_SECRET="b708d961577bdb39b3538a99d76086f359b36fe957d2265f576da472c7182ad6"
NEXT_PUBLIC_REFRESH_TOKEN_SECRET="b708d961577bdb39b3538a99d76086f359b36fe957d2265f576da472c7182ad6"
NEXT_PUBLIC_ACCESS_TOKEN_EXPIRED="600s"
NEXT_PUBLIC_REFRESH_TOKEN_EXPIRED="86400s"
```

> [!NOTE]
> You can change NEXT_PUBLIC_ACCESS_TOKEN_EXPIRED and NEXT_PUBLIC_REFRESH_TOKEN_EXPIRED in a short time to view how sessions change when logged in

## 🌵 Refresh token rotation

> [!IMPORTANT]
> Choose 1 of 2 strategies below or use both, it is up to you

### Use setInterval

You can use `setInterval` to update the access token, this ensures that the token will not expire in every API call next

```tsx
# Go to file `TokenProvider.tsx` to see example
useEffect(() => {
    const updateAccessToken = async () => {
        try {
            const res = await axiosClient.post('/api/auth/refresh', {
                refreshToken: session?.user?.refreshToken,
            });
            await update({ user: res.data });
        } catch (error) {
            if (error instanceof AxiosError) {
                message.loading('Refresh token expired, logging out');
                setTimeout(signOut, 1000);
            }
        } finally {
            if (isFirstMounted) {
                setIsFirstMounted(false);
            }
        }
    };

    if (session) {
        // Check if first render
        if (isFirstMounted) {
            updateAccessToken();
        }

        // Keep checking after atime
        const timer = setInterval(updateAccessToken, refreshTime);

        // Clean up
        return () => clearInterval(timer);
    }
}, [session, refreshTime, isFirstMounted, message, update]);
```

### Use interceptors

You can use `interceptors` for responses in Axios. Whenever a response receives a message `jwt expired`, we call the `update` function to refresh the access token and re-request API

```tsx
# Go to file `AxiosProvider.tsx` to see example
const responseIntercept = axiosAuth.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error instanceof AxiosError) {
            const prevRequest = error.config as AxiosRequestConfig;

            // If the error message is `jwt expired` and there is no originalRequest.retry flag,
            // it means the token has expired and we need to refresh it
            if (error.response?.data.message === 'jwt expired' && !prevRequest.retry) {
                prevRequest.retry = true;
            }

            try {
                await update();
                prevRequest.headers['Authorization'] = `Bearer ${session?.user?.accessToken}`;
                return axiosAuth(prevRequest);
            } catch (error) {
                // Handle refresh token error or redirect to login
            }
        }
        return Promise.reject(error);
    }
);
```

## 🌵 Middleware

### For protected router

> [!IMPORTANT]
> Choose only 1 of 2 strategies below

1. Use `middleware.ts` file to check your private router and navigate another router with custom `auth` function in Auth.js
2. If you don't want use custom `auth` function, go to `@/lib/auth.ts` and see `authorized` callback, this has been commented. You can uncomment this code and in `middleware.ts`, remove custom `auth` function and simply add `export default auth`

### For API

Go to `@/hocs/withMiddleware.ts` file and `@/app/api/users/routes.ts` to see how this middleware work

## 🌵 Reference

[Refresh Token with Next Auth and Axios Interceptors](https://www.youtube.com/watch?v=RPl0r-Yl6pU)  
[Middleware for router handler](https://github.com/undrash/next.js-api-middleware)
