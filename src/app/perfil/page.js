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
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-primary">Mi Perfil</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Editar Perfil
            </button>
          )}
        </div>

        {/* Avatar / Información básica */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">
              {session.user.name || 'Usuario'}
            </h2>
            <p className="text-gray-600">{session.user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {session.user.role === 'patient' ? 'Paciente' : 
               session.user.role === 'doctor' ? 'Doctor' : 'Administrador'}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-600 transition"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Nombre completo
                </label>
                <p className="text-lg">{session.user.name || 'No especificado'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-lg">{session.user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Teléfono
                </label>
                <p className="text-lg">{formData.phone || 'No especificado'}</p>
              </div>

              {session.user.role === 'patient' && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tipo de sangre
                  </label>
                  <p className="text-lg">{formData.bloodType || 'No especificado'}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Rol
                </label>
                <p className="text-lg capitalize">
                  {session.user.role === 'patient' ? 'Paciente' : 
                   session.user.role === 'doctor' ? 'Doctor' : 'Administrador'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Miembro desde
                </label>
                <p className="text-lg">
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
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-xl font-semibold mb-4">Accesos Rápidos</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/mi-calendario"
              className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Mi Calendario</span>
              </div>
            </Link>

            <Link
              href="/servicios"
              className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-medium">Servicios</span>
              </div>
            </Link>

            <Link
              href="/contactanos"
              className="p-4 border rounded-lg hover:border-primary hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Contacto</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
