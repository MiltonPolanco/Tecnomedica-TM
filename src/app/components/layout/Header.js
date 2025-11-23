'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="flex items-center justify-between p-4">
      <Link className="text-primary font-semibold text-2xl hover:opacity-80 transition" href={'/'}>
        Tecnomedica
      </Link>

      <nav className="flex items-center gap-10 text-gray-500 font-semibold">
        <Link 
          href={'/'} 
          className={`hover:text-primary transition ${ isActive('/') ? 'text-primary' : '' }`}
        >
          Home
        </Link>
        <Link 
          href={'/servicios'}
          className={`hover:text-primary transition ${ isActive('/servicios') ? 'text-primary' : '' }`}
        >
          Servicios
        </Link>
        <Link 
          href={'/sobre-nosotros'}
          className={`hover:text-primary transition ${ isActive('/sobre-nosotros') ? 'text-primary' : '' }`}
        >
          Sobre nosotros
        </Link>
        <Link 
          href={'/contactanos'}
          className={`hover:text-primary transition ${ isActive('/contactanos') ? 'text-primary' : '' }`}
        >
          Contáctanos
        </Link>
        <Link 
          href={'/mi-calendario'}
          className={`hover:text-primary transition ${ isActive('/mi-calendario') ? 'text-primary' : '' }`}
        >
          Mi Calendario
        </Link>
        {status === 'authenticated' && (
          <Link 
            href={'/mis-citas'}
            className={`hover:text-primary transition ${ isActive('/mis-citas') ? 'text-primary' : '' }`}
          >
            Mis Citas
          </Link>
        )}
      </nav>

      <nav className="flex items-center gap-4">
        {status === 'authenticated' ? (
          <>
            <Link 
              href="/perfil"
              className="text-gray-700 hover:text-primary transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">
                {session.user?.name || session.user?.email?.split('@')[0]}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 rounded-full text-white px-6 py-2 transition"
              aria-label="Cerrar sesión"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              href={'/login'}
              className="hover:text-primary transition"
            >
              Login
            </Link>
            <Link
              href={'/register'}
              className="bg-primary hover:bg-blue-600 rounded-full text-white px-6 py-2 transition"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
