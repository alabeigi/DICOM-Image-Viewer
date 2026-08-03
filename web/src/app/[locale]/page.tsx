import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';

const Home = dynamic(() => import('@/components/DicomViewer/DicomViewer'), {
  ssr: false,
});

type Props = {
  params: { locale: string };
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Home />;
}
