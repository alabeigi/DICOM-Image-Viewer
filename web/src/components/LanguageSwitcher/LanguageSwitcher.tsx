'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useCallback, useEffect, useState } from 'react';
import { GlobeIcon } from '../DicomViewer/Icons';

const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLocale = useCallback(() => {
    const nextLocale = locale === 'en' ? 'fa' : 'en';
    router.replace(pathname, { locale: nextLocale });
  }, [locale, router, pathname]);

  const nextLabel = locale === 'en' ? t('fa') : t('en');

  if (!mounted) {
    return null;
  }

  return (
    <button
      className="lang-toggle"
      onClick={toggleLocale}
      aria-label={`Switch to ${nextLabel}`}
      title={nextLabel}
    >
      <GlobeIcon />
      <span className="lang-toggle-label">{nextLabel}</span>
    </button>
  );
};

export default LanguageSwitcher;
