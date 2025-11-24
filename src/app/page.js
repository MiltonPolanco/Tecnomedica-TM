import dynamic from 'next/dynamic';

// Lazy load de componentes pesados para mejor performance
const Hero = dynamic(() => import('./components/layout/Hero'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});

const Services = dynamic(() => import('./components/layout/Services'), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
    </>
  )
}
