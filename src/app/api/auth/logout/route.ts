import { NextRequest, NextResponse } from 'next/server'
import {
    getSessionIdFromRequest,
    deleteSession,
    clearSessionCookie
} from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        // Get session IF from cookie
        const sessionId = getSessionIdFromRequest(request)

        if (!sessionId) {
            return NextResponse.json(
                { error: 'No active session' },
                { status: 401 }
            )
        }

        // Delete the session from the database
        const sessionDeleted = await deleteSession(sessionId)

        if (!sessionDeleted) {
            return NextResponse.json(
                { error: 'Error while logging out' },
                { status: 500 }
            )
        }

        // Create a response indicating success
        const response = NextResponse.json(
            {
                success: true,
                message: 'Vous êtes déconnecté'
            },
            { status: 200 }
        )

        // Delete the session cookie from the client
        return clearSessionCookie(response)

    } catch (error) {
        console.error('Error while logging out:', error)

        // Even if there is an error, we want to clear the session cookie
        const response = NextResponse.json(
            { error: 'Error while logging out' },
            { status: 500 }
        )

        return clearSessionCookie(response)
    }
}