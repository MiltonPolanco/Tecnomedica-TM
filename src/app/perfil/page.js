'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PerfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodType: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        phone: session.user.phone || '',
        bloodType: session.user.bloodType || '',
      });
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implementar actualización de perfil
    alert('Función de actualización de perfil en desarrollo');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Perfil
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Avatar / Información básica */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl ring-4 ring-blue-100">
                {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  {session.user.name || 'Usuario'}
                </h2>
                <p className="text-gray-600 mb-3 flex items-center gap-2 justify-center md:justify-start">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {session.user.email}
                </p>
                <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                  {session.user.role === 'patient' ? '👤 Paciente' : 
                   session.user.role === 'doctor' ? '⚕️ Doctor' : '👔 Administrador'}
                </span>
              </div>
            </div>

            {/* Formulario de información */}
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  {session.user.role === 'patient' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de sangre
                      </label>
                      <select
                        value={formData.bloodType}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Nombre completo
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{session.user.name || 'No especificado'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Email
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{session.user.email}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Teléfono
                    </label>
                    <p className="text-lg font-semibold text-gray-900">{formData.phone || 'No especificado'}</p>
                  </div>

                  {session.user.role === 'patient' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Tipo de sangre
                      </label>
                      <p className="text-lg font-semibold text-gray-900">{formData.bloodType || 'No especificado'}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Rol
                    </label>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {session.user.role === 'patient' ? 'Paciente' : 
                       session.user.role === 'doctor' ? 'Doctor' : 'Administrador'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Miembro desde
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(session.user.createdAt || Date.now()).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Accesos rápidos */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Accesos Rápidos
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/mi-calendario"
                  className="group p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-900">Mi Calendario</span>
                  </div>
                </Link>

                <Link
                  href="/servicios"
                  className="group p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-900">Servicios</span>
                  </div>
                </Link>

                <Link
                  href="/contactanos"
                  className="group p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-900">Contacto</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
