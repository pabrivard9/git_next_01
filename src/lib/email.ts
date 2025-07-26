import { Resend } from 'resend'

// Configuration de Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Interface pour les données d'email
interface EmailData {
    to: string
    subject: string
    html: string
    text?: string
}

// Fonction pour envoyer un email avec Resend
export async function sendEmail(emailData: EmailData): Promise<boolean> {
    try {
        const { data, error } = await resend.emails.send({
            from: 'dev_next_01 <onboarding@resend.dev>', // Email par défaut de Resend
            to: [emailData.to],
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''), // Fallback text
        })

        if (error) {
            console.error('Erreur Resend:', error)
            return false
        }

        console.log('Email envoyé avec Resend:', data?.id)
        return true
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email avec Resend:', error)
        return false
    }
}

// Template pour l'email de récupération de mot de passe
export function createRecoveryEmailTemplate(pin: string): { subject: string; html: string } {
    return {
        subject: 'Code de récupération de mot de passe - dev_next_01',
        html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Code de récupération</title>
                <style>
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        line-height: 1.6;
                        color: #374151;
                        background-color: #f9fafb;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background-color: #1e3a8a;
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .content {
                        padding: 30px 20px;
                    }
                    .pin-container {
                        background-color: #eff6ff;
                        border: 2px solid #3b82f6;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .pin-code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #1e3a8a;
                        letter-spacing: 8px;
                        margin: 10px 0;
                        font-family: 'Courier New', monospace;
                    }
                    .warning {
                        background-color: #fef3c7;
                        border-left: 4px solid #f59e0b;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .footer {
                        background-color: #f3f4f6;
                        padding: 20px;
                        text-align: center;
                        font-size: 14px;
                        color: #6b7280;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Récupération de mot de passe</h1>
                    </div>
                    
                    <div class="content">
                        <h2>Bonjour,</h2>
                        
                        <p>Vous avez demandé la réinitialisation de votre mot de passe sur <strong>dev_next_01</strong>.</p>
                        
                        <p>Voici votre code de vérification :</p>
                        
                        <div class="pin-container">
                            <div class="pin-code">${pin}</div>
                            <p style="margin: 0; color: #1e3a8a; font-weight: 500;">Code de vérification</p>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Important :</strong>
                            <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                                <li>Ce code est valable pendant <strong>30 minutes</strong></li>
                                <li>Ne partagez jamais ce code avec personne</li>
                                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                            </ul>
                        </div>
                        
                        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
                        
                        <p>Cordialement,<br>L'équipe dev_next_01</p>
                    </div>
                    
                    <div class="footer">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                        <p>© ${new Date().getFullYear()} dev_next_01. Tous droits réservés.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }
}

// Template pour l'email de bienvenue
export function createWelcomeEmailTemplate(userName: string): { subject: string; html: string } {
    return {
        subject: 'Bienvenue sur dev_next_01 ! 🎉',
        html: `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenue sur dev_next_01</title>
                <style>
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                        line-height: 1.6;
                        color: #374151;
                        background-color: #f9fafb;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                        color: white;
                        padding: 40px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .welcome-container {
                        background-color: #ecfdf5;
                        border: 2px solid #10b981;
                        border-radius: 8px;
                        padding: 25px;
                        text-align: center;
                        margin: 25px 0;
                    }
                    .emoji {
                        font-size: 48px;
                        margin-bottom: 15px;
                    }
                    .features {
                        background-color: #f8fafc;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 25px 0;
                    }
                    .feature-item {
                        display: flex;
                        align-items: center;
                        margin: 10px 0;
                        padding: 10px;
                        background-color: white;
                        border-radius: 6px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .feature-icon {
                        background-color: #1e3a8a;
                        color: white;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 15px;
                        font-weight: bold;
                    }
                    .button {
                        display: inline-block;
                        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .footer {
                        background-color: #f3f4f6;
                        padding: 25px;
                        text-align: center;
                        font-size: 14px;
                        color: #6b7280;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="emoji">🎉</div>
                        <h1>Bienvenue sur dev_next_01 !</h1>
                    </div>
                    
                    <div class="content">
                        <h2>Bonjour ${userName} !</h2>
                        
                        <p>Félicitations ! Votre compte a été créé avec succès sur <strong>dev_next_01</strong>.</p>
                        
                        <div class="welcome-container">
                            <div class="emoji">✅</div>
                            <h3 style="color: #059669; margin: 0;">Inscription confirmée</h3>
                            <p style="margin: 10px 0 0 0; color: #047857;">Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme.</p>
                        </div>
                        
                        <div class="features">
                            <h3 style="color: #1e3a8a; margin-top: 0;">Ce que vous pouvez faire :</h3>
                            
                            <div class="feature-item">
                                <div class="feature-icon">👤</div>
                                <div>
                                    <strong>Gérer votre profil</strong><br>
                                    <span style="color: #6b7280; font-size: 14px;">Modifiez vos informations personnelles à tout moment</span>
                                </div>
                            </div>
                            
                            <div class="feature-item">
                                <div class="feature-icon">🔒</div>
                                <div>
                                    <strong>Sécurité renforcée</strong><br>
                                    <span style="color: #6b7280; font-size: 14px;">Récupération de mot de passe et sessions sécurisées</span>
                                </div>
                            </div>
                            
                            <div class="feature-item">
                                <div class="feature-icon">📱</div>
                                <div>
                                    <strong>Interface moderne</strong><br>
                                    <span style="color: #6b7280; font-size: 14px;">Design responsive et expérience utilisateur optimisée</span>
                                </div>
                            </div>
                        </div>
                        
                        <p>Vous êtes maintenant connecté et pouvez commencer à explorer la plateforme.</p>
                        
                        <p>Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>
                        
                        <p>Encore bienvenue et merci de nous avoir fait confiance !</p>
                        
                        <p>Cordialement,<br><strong>L'équipe dev_next_01</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p><strong>🎯 Astuce :</strong> Vous pouvez modifier vos préférences dans votre profil utilisateur.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                        <p>© ${new Date().getFullYear()} dev_next_01. Tous droits réservés.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }
}