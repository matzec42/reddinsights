// implement password hashing, sessions or JWTs & cookie verification, etc.
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-helpers'

const protectedRoutes = ['/dashboard', '/analyzer', '/about', '/contact', '/create-pdf']
const publicRoutes = ['/login', '/signup']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const sessionToken = req.cookies.get('session')?.value

    // redirect to login if trying to access protected route without a session
    if (isProtectedRoute && !sessionToken) {
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }

    // redirect to dashboard if already logged in and hitting a public route
    if (isPublicRoute && sessionToken) {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}