import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'LUAPP — Encuentros Discretos para Personas Casadas',
  description: 'La app de encuentros más discreta de LATAM. 100% anónimo, seguro y sin rastros.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} font-sans bg-[#fff8f1]`}>
        {children}
      </body>
    </html>
  )
}