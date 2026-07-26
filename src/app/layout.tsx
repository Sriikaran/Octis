import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LayoutWrapper } from '@/components/shared/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Jewellery Tracking System',
  description: 'Manage and track jewellery inflow and distribution',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <TooltipProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
