"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from "react";
import { signIn, useSession } from 'next-auth/react';
import { Mail, Lock, User, ArrowRight, Heart, CheckCircle } from 'lucide-react';

export default function Register() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userCreated, setUserCreated] = useState(false);
  const [error, setError] = useState('');

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = '/';
    }
  }, [status]);

  async function handleFormSubmit(ev) {
    ev.preventDefault();
    setCreatingUser(true);
    setError('');
    setUserCreated(false);

    // Validaciones del lado del cliente
    if (!email || !password) {
      setError('Por favor completa todos los campos requeridos');
      setCreatingUser(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setCreatingUser(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setUserCreated(true);
        // Auto-login después del registro exitoso
        setTimeout(async () => {
          await signIn('credentials', {
            email,
            password,
            callbackUrl: '/'
          });
        }, 1500);
      } else {
        setError(data.error || 'Error al crear usuario. Intenta nuevamente.');
      }
    } catch (err) {
      setError('Error de conexión. Por favor verifica tu internet.');
    } finally {
      setCreatingUser(false);
    }
  }
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mb-4 shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crea tu cuenta
          </h1>
          <p className="text-gray-600">
            Únete a miles de pacientes satisfechos
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {userCreated && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-green-700 font-medium">¡Cuenta creada exitosamente!</p>
                <p className="text-green-600 text-sm">Redirigiendo a tu panel...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Juan Pérez" 
                  value={name}
                  disabled={creatingUser}
                  onChange={ev => setName(ev.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={email}
                  required
                  disabled={creatingUser}
                  onChange={ev => setEmail(ev.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={password}
                  required
                  minLength={6}
                  disabled={creatingUser}
                  onChange={ev => setPassword(ev.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Debe tener al menos 6 caracteres
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={creatingUser}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            > 
              {creatingUser ? 'Creando cuenta...' : (
                <>
                  Crear cuenta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">o regístrate con</span>
              </div>
            </div>

            {/* Google Button */}
            <button 
              type="button" 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 py-3 rounded-xl font-medium text-gray-700 transition-all"
              disabled={creatingUser}
            >
              <Image src="/Google.png" alt="Google" width={20} height={20} />
              Continuar con Google
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link className="font-semibold text-blue-600 hover:text-blue-700 transition-colors" href={'/login'}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}