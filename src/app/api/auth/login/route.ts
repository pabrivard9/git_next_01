import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, hashPassword, isPasswordHashed } from '@/lib/password'
import {
    createSession,
    setSessionCookie,
    getClientIP,
    getClientUserAgent
} from '@/lib/session'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            )
        }

        // Search for the user in the database
        const user = await prisma.users.findUnique({
            where: {
                user_email: email
            },
            select: {
                user_id: true,
                user_email: true,
                user_password: true,
                user_active: true,
                user_lastloginat: true
            }
        })

        // Check if the user exists
        if (!user) {
            return NextResponse.json(
                { error: 'Email incorrect' },
                { status: 401 }
            )
        }

        // Check if the user is active
        if (!user.user_active) {
            return NextResponse.json(
                { error: 'Ce compte est désactivé' },
                { status: 401 }
            )
        }

        // Check the password with bcrypt
        let isPasswordValid = false
        let needPasswordUpdate = false

        // Check if the password is hashed in database
        if (isPasswordHashed(user.user_password)) {
            // bcrypt.compare
            isPasswordValid = await verifyPassword(password, user.user_password)
        } else {
            // simple.compare + hash password
            isPasswordValid = user.user_password === password
            needPasswordUpdate = true
        }

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Mot de passe incorrect' },
                { status: 401 }
            )
        }

        // Update password to bcrypt if it was stored as plain text
        const updateData: {
            user_lastloginat: Date;
            user_password?: string;
        } = {
            user_lastloginat: new Date()
        }

        if (needPasswordUpdate) {
            const hashedPassword = await hashPassword(password)
            updateData.user_password = hashedPassword
        }

        // Update the user's last login date and password if needed
        await prisma.users.update({
            where: {
                user_id: user.user_id
            },
            data: updateData
        })

        // Create a new session
        const sessionData = {
            user: {
                id: user.user_id,
                email: user.user_email,
                lastLogin: new Date()
            }
        }

        const clientIP = getClientIP(request)
        const userAgent = getClientUserAgent(request)

        const sessionId = await createSession(
            user.user_id,
            sessionData,
            clientIP,
            userAgent
        )

        // Login successful - Create response with session cookie
        const response = NextResponse.json(
            {
                success: true,
                message: 'Connexion réussie',
                user: {
                    id: user.user_id,
                    email: user.user_email,
                    lastLogin: new Date()
                }
            },
            { status: 200 }
        )

        // Set session cookie
        return setSessionCookie(response, sessionId)

    } catch (error) {
        console.error('Error while connecting:', error)
        return NextResponse.json(
            { error: 'Server error x' },
            { status: 500 }
        )
    }
}