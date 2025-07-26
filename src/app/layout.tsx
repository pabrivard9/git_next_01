import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '900'],
    style: ['normal'],
    display: 'swap'
})

export const metadata: Metadata = {
    title: 'dev_next_01',
    description: 'dev_next_01',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}