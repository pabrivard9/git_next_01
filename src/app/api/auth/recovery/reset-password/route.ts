import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import {
    createSession,
    setSessionCookie,
    getClientIP,
    getClientUserAgent
} from '@/lib/session'

// Validation du mot de passe
function validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const minLength = password.length >= 12
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    return {
        isValid: minLength && hasLetter && hasNumber,
        errors: [
            !minLength && 'Au moins 12 caractères',
            !hasLetter && 'Au moins 1 lettre',
            !hasNumber && 'Au moins 1 chiffre'
        ].filter(Boolean) as string[]
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { token, newPassword } = body

        if (!token || !newPassword) {
            return NextResponse.json(
                { error: 'Token et nouveau mot de passe requis' },
                { status: 400 }
            )
        }

        // Valider le nouveau mot de passe
        const passwordValidation = validatePassword(newPassword)
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: `Le mot de passe ne respecte pas les conditions : ${passwordValidation.errors.join(', ')}` },
                { status: 400 }
            )
        }

        // Rechercher le token de récupération valide
        const recoveryToken = await prisma.users_recovery_tokens.findFirst({
            where: {
                token_hash: token,
                token_active: true,
                token_expiresat: {
                    gt: new Date() // Token non expiré
                }
            },
            include: {
                users: {
                    select: {
                        user_id: true,
                        user_email: true,
                        user_password: true,
                        user_active: true
                    }
                }
            }
        })

        if (!recoveryToken || !recoveryToken.users.user_active) {
            return NextResponse.json(
                { error: 'Token invalide ou expiré' },
                { status: 401 }
            )
        }

        // Vérifier que le nouveau mot de passe n'est pas identique à l'ancien
        const isSamePassword = await verifyPassword(newPassword, recoveryToken.users.user_password)
        if (isSamePassword) {
            return NextResponse.json(
                { error: 'Le nouveau mot de passe ne peut pas être identique à l\'ancien' },
                { status: 400 }
            )
        }

        // Hasher le nouveau mot de passe
        const hashedNewPassword = await hashPassword(newPassword)

        // Mettre à jour le mot de passe de l'utilisateur
        await prisma.users.update({
            where: {
                user_id: recoveryToken.users.user_id
            },
            data: {
                user_password: hashedNewPassword,
                user_lastloginat: new Date(),
                user_updateat: new Date()
            }
        })

        // Désactiver le token de récupération utilisé
        await prisma.users_recovery_tokens.update({
            where: {
                token_id: recoveryToken.token_id
            },
            data: {
                token_active: false
            }
        })

        // Créer une nouvelle session pour connecter automatiquement l'utilisateur
        const sessionData = {
            user: {
                id: recoveryToken.users.user_id,
                email: recoveryToken.users.user_email,
                lastLogin: new Date()
            }
        }

        const clientIP = getClientIP(request)
        const userAgent = getClientUserAgent(request)

        const sessionId = await createSession(
            recoveryToken.users.user_id,
            sessionData,
            clientIP,
            userAgent
        )

        // Créer la réponse avec le cookie de session
        const response = NextResponse.json(
            {
                success: true,
                message: 'Mot de passe modifié avec succès',
                user: {
                    id: recoveryToken.users.user_id,
                    email: recoveryToken.users.user_email,
                    lastLogin: new Date()
                }
            },
            { status: 200 }
        )

        // Définir le cookie de session
        return setSessionCookie(response, sessionId)

    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}