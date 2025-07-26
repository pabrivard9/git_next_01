import { NextRequest, NextResponse } from 'next/server'
import {
    getSessionIdFromRequest,
    getSession
} from '@/lib/session'

export async function GET(request: NextRequest) {
    try {
        // Get session ID from the cookie
        const sessionId = getSessionIdFromRequest(request)

        if (!sessionId) {
            return NextResponse.json(
                {
                    authenticated: false,
                    error: 'No active session'
                },
                { status: 401 }
            )
        }

        // Get session data from the database
        const sessionData = await getSession(sessionId)

        if (!sessionData) {
            return NextResponse.json(
                {
                    authenticated: false,
                    error: 'Invalid or expired session'
                },
                { status: 401 }
            )
        }

        // Valid session, return user data
        return NextResponse.json(
            {
                authenticated: true,
                user: sessionData.user
            },
            { status: 200 }
        )

    } catch (error) {
        console.error('Error verifying session:', error)
        return NextResponse.json(
            {
                authenticated: false,
                error: 'Server error'
            },
            { status: 500 }
        )
    }
}