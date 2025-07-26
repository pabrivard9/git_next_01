import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { sendEmail, createWelcomeEmailTemplate } from '@/lib/email'
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
        const {
            gender,
            lastname,
            firstname,
            email,
            phone,
            phoneCountry,
            mobile,
            mobileCountry,
            language,
            password,
            confirmPassword
        } = body

        // Validation des champs requis
        if (!email || !password || !confirmPassword) {
            return NextResponse.json(
                { error: 'Email et mot de passe requis' },
                { status: 400 }
            )
        }

        // Validation du mot de passe
        const passwordValidation = validatePassword(password)
        if (!passwordValidation.isValid) {
            return NextResponse.json(
                { error: `Le mot de passe ne respecte pas les conditions : ${passwordValidation.errors.join(', ')}` },
                { status: 400 }
            )
        }

        // Vérification de la confirmation du mot de passe
        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: 'Les mots de passe ne sont pas identiques' },
                { status: 400 }
            )
        }

        // Vérifier si l'email existe déjà
        const existingUser = await prisma.users.findUnique({
            where: {
                user_email: email.toLowerCase().trim()
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Cet email existe déjà' },
                { status: 409 }
            )
        }

        // Hasher le mot de passe
        const hashedPassword = await hashPassword(password)

        // Préparer les numéros de téléphone complets
        const fullPhone = phone ? `${phoneCountry}${phone}` : null
        const fullMobile = mobile ? `${mobileCountry}${mobile}` : null

        // Créer l'utilisateur et son profil en une transaction
        const result = await prisma.$transaction(async (tx) => {
            // Créer l'utilisateur
            const newUser = await tx.users.create({
                data: {
                    user_email: email.toLowerCase().trim(),
                    user_password: hashedPassword,
                    user_active: true,
                    user_createdat: new Date(),
                    user_updateat: new Date(),
                    user_lastloginat: new Date()
                }
            })

            // Créer le profil
            const newProfile = await tx.users_details_profiles.create({
                data: {
                    user_id: newUser.user_id,
                    profile_gender: gender || 'neutre',
                    profile_lastname: lastname?.trim() || null,
                    profile_firstname: firstname?.trim() || null,
                    profile_phone: fullPhone,
                    profile_mobile: fullMobile,
                    profile_language: language || 'fr',
                    profile_active: true,
                    profile_lastupdate: new Date()
                }
            })

            return { user: newUser, profile: newProfile }
        })

        // Envoyer l'email de bienvenue
        const emailTemplate = createWelcomeEmailTemplate(
            result.profile.profile_firstname || result.profile.profile_lastname || 'Nouvel utilisateur'
        )
        
        const emailSent = await sendEmail({
            to: result.user.user_email,
            subject: emailTemplate.subject,
            html: emailTemplate.html
        })

        if (!emailSent) {
            console.warn('Échec envoi email de bienvenue pour:', result.user.user_email)
            // On continue quand même, l'inscription reste valide
        }

        // Créer une session pour connexion automatique
        const sessionData = {
            user: {
                id: result.user.user_id,
                email: result.user.user_email,
                lastLogin: new Date()
            }
        }

        const clientIP = getClientIP(request)
        const userAgent = getClientUserAgent(request)

        const sessionId = await createSession(
            result.user.user_id,
            sessionData,
            clientIP,
            userAgent
        )

        // Réponse de succès avec cookie de session
        const response = NextResponse.json(
            {
                success: true,
                message: 'Inscription réussie',
                user: {
                    id: result.user.user_id,
                    email: result.user.user_email,
                    profile: {
                        firstname: result.profile.profile_firstname,
                        lastname: result.profile.profile_lastname,
                        gender: result.profile.profile_gender,
                        language: result.profile.profile_language
                    }
                }
            },
            { status: 201 }
        )

        // Définir le cookie de session
        return setSessionCookie(response, sessionId)

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error)
        return NextResponse.json(
            { error: 'Erreur serveur lors de l\'inscription' },
            { status: 500 }
        )
    }
}