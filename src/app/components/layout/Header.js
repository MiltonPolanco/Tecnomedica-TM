'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between p-4">
      <Link className="text-primary font-semibold text-2xl" href={'/'}>
        Tecnomedica
      </Link>

      <nav className="flex items-center gap-10 text-gray-500 font-semibold">
        <Link href={'/'}>Home</Link>
        <Link href={'/servicios'}>Servicios</Link>
        <Link href={'/sobre-nosotros'}>Sobre nosotros</Link>
        <Link href={'/contactanos'}>Contáctanos</Link>
        <Link href={'/mi-calendario'}>Mi Calendario</Link>
      </nav>

      <nav className="flex items-center gap-4">
        {status === 'authenticated' ? (
          <button
            onClick={() => signOut()}
            className="bg-primary rounded-full text-white px-6 py-2"
          >
            Logout
          </button>
        ) : (
          <>
            <Link href={'/login'}>Login</Link>
            <Link
              href={'/register'}
              className="bg-primary rounded-full text-white px-6 py-2"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
