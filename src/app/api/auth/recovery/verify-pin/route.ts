import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, pin } = body

        if (!email || !pin) {
            return NextResponse.json(
                { error: 'Email et code PIN requis' },
                { status: 400 }
            )
        }

        // Vérifier si l'utilisateur existe
        const user = await prisma.users.findUnique({
            where: {
                user_email: email
            },
            select: {
                user_id: true,
                user_active: true
            }
        })

        if (!user || !user.user_active) {
            return NextResponse.json(
                { error: 'Utilisateur invalide' },
                { status: 404 }
            )
        }

        // Rechercher le token de récupération valide
        const recoveryToken = await prisma.users_recovery_tokens.findFirst({
            where: {
                user_id: user.user_id,
                token_pin: pin.toString(),
                token_active: true,
                token_expiresat: {
                    gt: new Date() // Token non expiré
                }
            }
        })

        if (!recoveryToken) {
            return NextResponse.json(
                { error: 'Code PIN invalide' },
                { status: 401 }
            )
        }

        // Le PIN est valide, retourner le token hash pour la prochaine étape
        return NextResponse.json(
            {
                success: true,
                message: 'Code PIN valide',
                token: recoveryToken.token_hash
            },
            { status: 200 }
        )

    } catch (error) {
        console.error('Erreur lors de la vérification du code PIN:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}