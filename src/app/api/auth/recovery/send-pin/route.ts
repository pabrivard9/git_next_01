import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, createRecoveryEmailTemplate } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
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
                user_email: true,
                user_active: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Cet utilisateur n\'existe pas' },
                { status: 404 }
            )
        }

        if (!user.user_active) {
            return NextResponse.json(
                { error: 'Ce compte est désactivé' },
                { status: 401 }
            )
        }

        // Désactiver tous les tokens de récupération existants pour cet utilisateur
        await prisma.users_recovery_tokens.updateMany({
            where: {
                user_id: user.user_id,
                token_active: true
            },
            data: {
                token_active: false
            }
        })

        // Générer un code PIN de 6 chiffres
        const pin = Math.floor(100000 + Math.random() * 900000).toString()
        
        // Créer un hash unique pour le token
        const tokenHash = crypto.randomBytes(32).toString('hex')
        
        // Date d'expiration (30 minutes)
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000)

        // Créer le token de récupération
        await prisma.users_recovery_tokens.create({
            data: {
                user_id: user.user_id,
                token_pin: pin,
                token_hash: tokenHash,
                token_expiresat: expiresAt,
                token_active: true
            }
        })

        // Préparer l'email
        const emailTemplate = createRecoveryEmailTemplate(pin)
        
        // Envoyer l'email
        const emailSent = await sendEmail({
            to: user.user_email,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        })

        if (!emailSent) {
            return NextResponse.json(
                { error: 'Erreur lors de l\'envoi de l\'email' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Code PIN envoyé par email'
            },
            { status: 200 }
        )

    } catch (error) {
        console.error('Erreur lors de l\'envoi du code PIN:', error)
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}