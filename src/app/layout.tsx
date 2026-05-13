import { type Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotify Charge Manager',
  description: 'Gerencie suas cobranças do Spotify Family',
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