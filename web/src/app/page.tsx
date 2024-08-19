import dynamic from 'next/dynamic';

const Home = dynamic(() => import('@/components/DicomViewer/DicomViewer'), {
  ssr: false,
});

export default Home;
