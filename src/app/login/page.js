'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from "react";
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Heart } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginInProgress, setLoginInProgress] = useState(false);
    const [error, setError] = useState('');

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (status === 'authenticated') {
            router.push('/');
        }
    }, [status, router]);

    async function handleFormSubmit(ev) {
        ev.preventDefault();
        setLoginInProgress(true);
        setError('');

        try {
            const result = await signIn('credentials', { 
                email, 
                password, 
                redirect: false 
            });

            if (result?.error) {
                setError('Email o contraseña incorrectos');
                setLoginInProgress(false);
            } else if (result?.ok) {
                // Login exitoso, forzar recarga completa para actualizar sesión
                window.location.href = '/';
            }
        } catch (err) {
            setError('Error al iniciar sesión. Intenta nuevamente.');
            setLoginInProgress(false);
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
                        Bienvenido de vuelta
                    </h1>
                    <p className="text-gray-600">
                        Ingresa a tu cuenta para continuar
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleFormSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="tu@email.com" 
                                    value={email}
                                    required
                                    disabled={loginInProgress}
                                    onChange={ev => setEmail(ev.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    value={password}
                                    required
                                    disabled={loginInProgress}
                                    onChange={ev => setPassword(ev.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            disabled={loginInProgress} 
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        > 
                            {loginInProgress ? 'Iniciando sesión...' : (
                                <>
                                    Iniciar sesión
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
                                <span className="px-4 bg-white text-gray-500">o continúa con</span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <button 
                            type="button" 
                            onClick={() => signIn('google', { callbackUrl: '/' })}
                            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 py-3 rounded-xl font-medium text-gray-700 transition-all"
                            disabled={loginInProgress}
                        >
                            <Image src="/Google.png" alt="Google" width={20} height={20} />
                            Continuar con Google
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        ¿No tienes cuenta?{' '}
                        <Link className="font-semibold text-blue-600 hover:text-blue-700 transition-colors" href={'/register'}>
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}