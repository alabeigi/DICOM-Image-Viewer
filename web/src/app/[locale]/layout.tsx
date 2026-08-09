import type { Metadata } from 'next';
import { Inter, Vazirmatn } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const vazirmatn = Vazirmatn({ subsets: ['arabic'], variable: '--font-vazirmatn' });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000');

  const titles: Record<string, string> = {
    en: 'DICOM Image Viewer',
    fa: 'مشاهده‌گر تصاویر DICOM',
  };

  const descriptions: Record<string, string> = {
    en: 'Upload and view DICOM medical images with precision and clarity',
    fa: 'بارگذاری و مشاهده تصاویر پزشکی DICOM با دقت و وضوح',
  };

  return {
    metadataBase: new URL(baseUrl),
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'en': `${baseUrl}/en`,
        'fa': `${baseUrl}/fa`,
      },
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
      siteName: 'DICOM Image Viewer',
      url: `${baseUrl}/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Props) {
  const { locale } = await params;

  const messages = await getMessages();
  const direction = locale === 'fa' ? 'rtl' : 'ltr';
  const fontClass = `${inter.variable} ${vazirmatn.variable}`;

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={fontClass} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
