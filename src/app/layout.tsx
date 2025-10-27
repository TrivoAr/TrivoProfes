import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from "@/components/providers/Providers"
import { ToasterWrapper } from "@/components/ui/toaster-wrapper";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Trivo Admin Panel',
  description: 'Admin panel for Trivo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <Providers>
          {children}
          <ToasterWrapper />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
