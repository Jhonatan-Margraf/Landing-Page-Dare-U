import type { Metadata } from 'next'
import { Bebas_Neue, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'DareU – Aceite o Desafio. Ganhe de Verdade.',
  description:
    'DareU é a plataforma social de desafios com recompensa. Crie, participe e conclua etapas com análise automática.',
  keywords: 'desafios engraçados, ganhar dinheiro, desafio pago, DareU, desafios online',
  openGraph: {
    title: 'DareU – Aceite o Desafio. Ganhe de Verdade.',
    description: 'Publique um desafio, receba participantes e conclua com recompensa validada.',
    type: 'website',
  },
  icons: {
    icon: '/imagens/logo-icon-sem-fundo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${plusJakarta.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
