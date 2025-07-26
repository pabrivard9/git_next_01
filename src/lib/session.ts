import { NextRequest, NextResponse } from 'next/server'
import { prisma } from './prisma'
import crypto from 'crypto'

// Session configuration
export const SESSION_CONFIG = {
    cookieName: 'session_id',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
}

// Interface for session data
export interface SessionData {
    user: {
        id: number
        email: string
        lastLogin: Date
    }
}

// Henerate a random session ID
export function generateSessionId(): string {
    return crypto.randomBytes(64).toString('hex')
}

// Create a new session in database
export async function createSession(
    userId: number,
    sessionData: SessionData,
    ipAddress?: string,
    userAgent?: string
): Promise<string> {
    const sessionId = generateSessionId()
    const expiresAt = new Date(Date.now() + SESSION_CONFIG.maxAge)

    await prisma.users_sessions.create({
        data: {
            session_id: sessionId,
            user_id: userId,
            session_data: JSON.stringify(sessionData),
            session_expiresat: expiresAt,
            session_ipaddress: ipAddress || null,
            session_useragent: userAgent || null,
            session_active: true,
        }
    })
    return sessionId
}

// Get session ID by user ID
export async function getSession(sessionId: string): Promise<SessionData | null> {
    if (!sessionId) return null

    try {
        const session = await prisma.users_sessions.findFirst({
            where: {
                session_id: sessionId,
                session_active: true,
                session_expiresat: {
                    gt: new Date() // Session not expired
                }
            },
            include: {
                users: {
                    select: {
                        user_id: true,
                        user_email: true,
                        user_active: true,
                        user_lastloginat: true
                    }
                }
            }
        })

        if (!session || !session.users.user_active) {
            return null
        }

        // Update session updatedAt timestamp
        await prisma.users_sessions.update({
            where: {
                session_id: sessionId
            },
            data: {
                session_updatedat: new Date()
            }
        })

        // Parse session data
        const sessionData = session.session_data ? JSON.parse(session.session_data) : {}

        return {
            ...sessionData,
            user: {
                id: session.users.user_id,
                email: session.users.user_email,
                lastLogin: session.users.user_lastloginat || new Date()
            }
        }

    } catch (error) {
        console.error('Error retrieving session:', error)
        return null
    }
}

// Update an existing session
export async function updateSession(
    sessionId: string,
    sessionData: SessionData
): Promise<boolean> {
    try {
        await prisma.users_sessions.update({
            where: {
                session_id: sessionId,
            },
            data: {
                session_data: JSON.stringify(sessionData),
                session_updatedat: new Date()
            }
        })
        return true
    } catch (error) {
        console.error('Error updating session:', error)
        return false
    }
}

// Delete a session by sessionID
export async function deleteSession(sessionId: string): Promise<boolean> {
    try {
        await prisma.users_sessions.update({
            where: {
                session_id: sessionId
            },
            data: {
                session_active: false
            }
        })
        return true
    } catch (error) {
        console.error('Error deleting session:', error)
        return false
    }
}

// Delete all active sessions for a user
export async function deleteAllUserSessions(userId: number): Promise<boolean> {
    try {
        await prisma.users_sessions.updateMany({
            where: {
                user_id: userId,
                session_active: true
            },
            data: {
                session_active: false
            }
        })
        return true
    } catch (error) {
        console.error('Erreur lors de la suppression des sessions utilisateur:', error)
        return false
    }
}

// Cleanup expired sessions
export async function cleanupExpiredSessions(): Promise<number> {
    try {
        const result = await prisma.users_sessions.updateMany({
            where: {
                session_expiresat: {
                    lt: new Date() // expired sessions
                },
                session_active: true
            },
            data: {
                session_active: false
            }
        })
        return result.count
    } catch (error) {
        console.error('Error cleaning sessions:', error)
        return 0
    }
}

// Set the session cookie in the response
export function setSessionCookie(response: NextResponse, sessionId: string): NextResponse {
    response.cookies.set(SESSION_CONFIG.cookieName, sessionId, {
        maxAge: SESSION_CONFIG.maxAge / 1000,
        httpOnly: SESSION_CONFIG.httpOnly,
        secure: SESSION_CONFIG.secure,
        sameSite: SESSION_CONFIG.sameSite,
    })
    return response
}

// Delete the session cookie from the response
export function clearSessionCookie(response: NextResponse): NextResponse {
    response.cookies.delete(SESSION_CONFIG.cookieName)
    return response
}

// Get the session ID from the request cookies
export function getSessionIdFromRequest(request: NextRequest): string | null {
    return request.cookies.get(SESSION_CONFIG.cookieName)?.value || null
}

// Get the client IP address from the request headers
export function getClientIP(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown'
    )
}

// Get the client user agent from the request headers
export function getClientUserAgent(request: NextRequest): string {
    return request.headers.get('user-agent') || 'unknown'
}