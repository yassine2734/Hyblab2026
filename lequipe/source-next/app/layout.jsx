import './globals.css'
import SiteShell from '../components/SiteShell'

const basePath = process.env.NODE_ENV === 'production' ? '/lequipe' : ''

export const metadata = {
    title: 'Equipe',
    description: 'Redécouvrez les legendes de la CDM à travers leurs interviews, et collectionné leurs cartes',
}


export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#FAF7F4',
}

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <head>
                <link rel="icon" href={`${basePath}/icone/icone.png`} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>

            <body>
                <SiteShell>{children}</SiteShell>
            </body>
        </html>
    )
}
