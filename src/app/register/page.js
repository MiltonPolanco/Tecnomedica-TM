"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from "react";
import { signIn, useSession } from 'next-auth/react';

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
    <section className="mt-8">
      <h1 className="text-center text-primary text-4xl mb-4">
        Registro
      </h1>
      {userCreated && (
        <div className="my-4 text-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ¡Usuario creado exitosamente! <br />
          Redirigiendo...
        </div>
      )}
      {error && (
        <div className="my-4 text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form className="block max-w-xs mx-auto" onSubmit={handleFormSubmit}>
        <input 
          type="text" 
          placeholder="Nombre (opcional)" 
          value={name}
          disabled={creatingUser}
          onChange={ev => setName(ev.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          required
          disabled={creatingUser}
          onChange={ev => setEmail(ev.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña (mín. 6 caracteres)" 
          value={password}
          required
          minLength={6}
          disabled={creatingUser}
          onChange={ev => setPassword(ev.target.value)}
        />
        <button type="submit" disabled={creatingUser}> 
          {creatingUser ? 'Registrando...' : 'Registrarse'}
        </button>
        <div className="my-4 text-center text-gray-500">
          o regístrate con
        </div>
        <button 
          type="button" 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex mt-4 gap-4 justify-center"
          disabled={creatingUser}
        >
          <Image src="/Google.png" alt="Google" width={25} height={25} />
          Continuar con Google
        </button>
        <div className="text-center my-4 text-gray-500 border-t pt-4">
          ¿Ya tienes cuenta? {' '}
          <Link className="underline hover:text-primary" href={'/login'}>
            Inicia sesión &raquo;
          </Link>
        </div>
      </form>
    </section>
  );
}