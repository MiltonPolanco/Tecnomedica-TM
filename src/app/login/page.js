'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from "react";
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
        <section className="mt-8">
            <h1 className="text-center text-primary text-4xl mb-4">
                Iniciar Sesión
            </h1>
            
            {error && (
                <div className="my-4 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-xs mx-auto">
                    {error}
                </div>
            )}

            <form className="block max-w-xs mx-auto" onSubmit={handleFormSubmit}>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={email}
                    required
                    disabled={loginInProgress}
                    onChange={ev => setEmail(ev.target.value)} 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Contraseña" 
                    value={password}
                    required
                    disabled={loginInProgress}
                    onChange={ev => setPassword(ev.target.value)}
                />
                <button disabled={loginInProgress} type="submit"> 
                    {loginInProgress ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
                <div className="my-4 text-center text-gray-500">
                    o inicia sesión con
                </div>
                <button 
                    type="button" 
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="flex mt-4 gap-4 justify-center"
                    disabled={loginInProgress}
                >
                    <Image src="/Google.png" alt="Google" width={25} height={25} />
                    Continuar con Google
                </button>
                <div className="text-center my-4 text-gray-500 border-t pt-4">
                    ¿No tienes cuenta? {' '}
                    <Link className="underline hover:text-primary" href={'/register'}>
                        Regístrate aquí &raquo;
                    </Link>
                </div>
            </form>
        </section>
    );
}