import { type Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotify do Gabriel',
  description: 'Sistema programado por Gabriel Trajano',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#0a0a0f] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}