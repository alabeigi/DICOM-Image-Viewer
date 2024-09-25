import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppWrapper } from './appWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DICOM Image Viewer',
  description: 'DICOM image upload and viewer with Next.js and TypeScript',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AppWrapper>
        <body className={inter.className}>{children}</body>
      </AppWrapper>
    </html>
  );
}
