import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Récupération de mot de passe - dev_next_01',
    description: 'Récupération de mot de passe',
}

export default function RecoveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}