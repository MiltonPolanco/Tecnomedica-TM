'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Calendar, FileText, User, LogOut, Activity, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link className="flex items-center gap-2 group" href={'/'}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Tecnomédica
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href={'/'} 
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Inicio
            </Link>
            <Link 
              href={'/servicios'}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/servicios') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Servicios
            </Link>
            <Link 
              href={'/sobre-nosotros'}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/sobre-nosotros') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Nosotros
            </Link>
            <Link 
              href={'/contactanos'}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isActive('/contactanos') 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Contacto
            </Link>
            {status === 'authenticated' && (
              <>
                {session?.user?.role === 'admin' && (
                  <Link 
                    href={'/admin/usuarios'}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isActive('/admin/usuarios') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {session?.user?.role === 'doctor' && (
                  <Link 
                    href={'/dashboard-doctor'}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      isActive('/dashboard-doctor') 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <Link 
                  href={'/mi-calendario'}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isActive('/mi-calendario') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Calendario
                </Link>
                <Link 
                  href={'/mis-citas'}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isActive('/mis-citas') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Mis Citas
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'authenticated' ? (
              <>
                <Link 
                  href="/perfil"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-sm">
                    {session.user?.name || session.user?.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all font-medium"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link 
                  href={'/login'}
                  className="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href={'/register'}
                  className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link 
              href={'/'} 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Inicio
            </Link>
            <Link 
              href={'/servicios'}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium ${
                isActive('/servicios') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Servicios
            </Link>
            <Link 
              href={'/sobre-nosotros'}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium ${
                isActive('/sobre-nosotros') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Nosotros
            </Link>
            <Link 
              href={'/contactanos'}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2 rounded-lg font-medium ${
                isActive('/contactanos') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Contacto
            </Link>
            {status === 'authenticated' && (
              <>
                {session?.user?.role === 'admin' && (
                  <Link 
                    href={'/admin/usuarios'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                      isActive('/admin/usuarios') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                {session?.user?.role === 'doctor' && (
                  <Link 
                    href={'/dashboard-doctor'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                      isActive('/dashboard-doctor') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                <Link 
                  href={'/mi-calendario'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    isActive('/mi-calendario') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Calendario
                </Link>
                <Link 
                  href={'/mis-citas'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    isActive('/mis-citas') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Mis Citas
                </Link>
                <Link 
                  href={'/perfil'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    isActive('/perfil') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </>
            )}
            {status !== 'authenticated' && (
              <div className="pt-3 space-y-2 border-t border-gray-100 mt-2">
                <Link 
                  href={'/login'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href={'/register'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
