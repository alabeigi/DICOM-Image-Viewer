'use client';

import dynamic from 'next/dynamic';

const DicomViewer = dynamic(() => import('@/components/DicomViewer/DicomViewer'), {
  ssr: false,
});

export default function Home() {
  return <DicomViewer />;
}

