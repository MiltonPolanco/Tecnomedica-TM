'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Key, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';

// Lista de países con códigos telefónicos
const COUNTRIES = [
  { code: '+1', country: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+52', country: 'MX', name: 'México', flag: '🇲🇽' },
  { code: '+503', country: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+502', country: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+504', country: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', country: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', country: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: '+57', country: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: '+58', country: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', country: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+51', country: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: '+591', country: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+56', country: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: '+54', country: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: '+598', country: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+595', country: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+55', country: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: '+34', country: 'ES', name: 'España', flag: '🇪🇸' },
];

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phoneCountry: '+503', // El Salvador por defecto
    bloodType: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      // Extraer código de país si existe en el teléfono
      let phoneNumber = session.user.phone || '';
      let countryCode = '+503'; // Default
      
      if (phoneNumber) {
        // Buscar si el teléfono comienza con algún código de país
        const matchedCountry = COUNTRIES.find(c => phoneNumber.startsWith(c.code));
        if (matchedCountry) {
          countryCode = matchedCountry.code;
          phoneNumber = phoneNumber.substring(matchedCountry.code.length).trim();
        }
      }
      
      setFormData({
        name: session.user.name || '',
        phone: phoneNumber,
        phoneCountry: countryCode,
        bloodType: session.user.bloodType || '',
      });
    }
  }, [session?.user]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest('.country-selector')) {
        setShowCountryDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

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
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Combinar código de país con número de teléfono
      const fullPhone = formData.phone ? `${formData.phoneCountry} ${formData.phone}` : '';
      
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: fullPhone,
          bloodType: formData.bloodType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
        setIsEditing(false);
        
        // Actualizar sesión con los nuevos datos
        await update({
          user: {
            name: data.user.name,
            phone: data.user.phone,
            bloodType: data.user.bloodType,
          },
        });

        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al actualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordModal(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al cambiar contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
              {!isEditing && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all border border-white/30"
                  >
                    <Key className="w-4 h-4" />
                    <span className="hidden sm:inline">Cambiar Contraseña</span>
                    <span className="sm:hidden">Contraseña</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mensajes */}
          {message.text && (
            <div className={`mx-8 mt-6 p-4 rounded-xl border-l-4 flex items-start gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`font-medium ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {message.text}
              </p>
            </div>
          )}

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
                    <div className="flex gap-2">
                      {/* Selector de País */}
                      <div className="relative country-selector">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="h-full px-3 py-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center gap-2 min-w-[120px]"
                        >
                          <span className="text-xl">
                            {COUNTRIES.find(c => c.code === formData.phoneCountry)?.flag}
                          </span>
                          <span className="font-medium text-gray-700">
                            {formData.phoneCountry}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                        
                        {/* Dropdown de países */}
                        {showCountryDropdown && (
                          <div className="absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
                            {COUNTRIES.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, phoneCountry: country.code });
                                  setShowCountryDropdown(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                                  formData.phoneCountry === country.code ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                }`}
                              >
                                <span className="text-2xl">{country.flag}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{country.name}</div>
                                  <div className="text-sm text-gray-500">{country.code}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Input de número */}
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d\s-]/g, '') })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="1234 5678"
                      />
                    </div>
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
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setMessage({ type: '', text: '' });
                    }}
                    disabled={loading}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
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
                    <p className="text-lg font-semibold text-gray-900">{session.user.phone || 'No especificado'}</p>
                  </div>

                  {session.user.role === 'patient' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Tipo de sangre
                      </label>
                      <p className="text-lg font-semibold text-gray-900">{session.user.bloodType || 'No especificado'}</p>
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

      {/* Modal de Cambio de Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Cambiar Contraseña</h3>
              <p className="text-gray-600">
                Ingresa tu contraseña actual y la nueva contraseña
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Cambiar Contraseña
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                    setMessage({ type: '', text: '' });
                  }}
                  disabled={loading}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
