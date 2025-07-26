import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Middleware configuration
const AUTH_CONFIG = {
    cookieName: 'session_id',
    loginUrl: '/auth/login',
    defaultRedirect: '/',
}

// Protected routes (requiring authentication)
const PROTECTED_ROUTES = [
    '/',
    '/profile'
]

// Public routes (not requiring authentication)
const PUBLIC_ROUTES = [
    '/auth/login',
    '/auth/recovery',
    '/auth/forgot-password'
]

// Excluded API routes (not requiring authentication)
const API_ROUTES_EXCLUDED = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/me',
    '/api/auth/recovery'
]

// Check if the session is valid
async function validateSession(sessionId: string): Promise<boolean> {
    if (!sessionId) return false

    try {
        const prisma = new PrismaClient()

        const session = await prisma.users_sessions.findFirst({
            where: {
                session_id: sessionId,
                session_active: true,
                session_expiresat: {
                    gt: new Date()
                }
            },
            include: {
                users: {
                    select: {
                        user_active: true
                    }
                }
            }
        })

        await prisma.$disconnect()

        return !!(session && session.users.user_active)
    } catch (error) {
        console.error('Erreur lors de la validation de session:', error)
        return false
    }
}

// Check if a route is protected and need authentication
function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

// Check if route is public and does not require authentication
function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

// Check if an API route is excluded from authentication
function isExcludedApiRoute(pathname: string): boolean {
    return API_ROUTES_EXCLUDED.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Exclude static files and specific paths from middleware processing
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/icons') ||
        isExcludedApiRoute(pathname)
    ) {
        return NextResponse.next()
    }

    // Get the session ID from cookies
    const sessionId = request.cookies.get(AUTH_CONFIG.cookieName)?.value

    // Validate the session ID
    const isAuthenticated = sessionId ? await validateSession(sessionId) : false

    // Protected routes management
    if (isProtectedRoute(pathname)) {
        if (!isAuthenticated) {
            const loginUrl = new URL(AUTH_CONFIG.loginUrl, request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
        return NextResponse.next()
    }

    // Public routes management
    if (isPublicRoute(pathname)) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL(AUTH_CONFIG.defaultRedirect, request.url))
        }
        return NextResponse.next()
    }

    // General API routes management
    if (pathname.startsWith('/api/')) {
        if (!isAuthenticated) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            )
        }
        return NextResponse.next()
    }
    return NextResponse.next()
}

// Routes config for the middleware
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}