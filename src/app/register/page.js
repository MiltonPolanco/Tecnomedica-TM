"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from "react";
import { signIn } from 'next-auth/react';

export default function Register() {

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [creatingUser, setCreatingUser] = useState(false);
const [userCreated, setUserCreated] = useState(false);
const [error, setError] = useState(false);
async function handleFormSubmit(ev) {
    ev.preventDefault();
    setCreatingUser(true);
    setError(false);
    setUserCreated(false);
    const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({email, password}),
        headers: {'Content-Type': 'application/json'},
    });
    if (response.ok) {
        setUserCreated(true);
    }
    else {
        setError(true); 
    }
     setCreatingUser(false);
}
return (
<section className="mt-8">
        <h1 className="text-center text-primary text-4x1 mb-4">
            Register
        </h1>
        {userCreated && (
            <div className="my-4 text-center">
                User created successfully. <br />Now you can {' '}
                <Link className="underline" href={'/login'}>Login &raquo;</Link>
            </div>
        )}
        {error && (
            <div className="my-4 text-center">
            An error has accoured. <br />
            Please try again later.
            </div>
        )}

        <form className="block max-w-xs mx-auto" onSubmit={handleFormSubmit}>
            <input type="email" placeholder="Email" value={email}
                    disabled={creatingUser}
                    onChange={ev => setEmail(ev.target.value)} />
            <input type="password" placeholder="Password" value={password}
                    disabled={creatingUser}
                    onChange={ev => setPassword(ev.target.value)}/>
            <button type="submit" disabled={creatingUser}> 
                Register 
            </button>
            <div className="my-4 text-center text-gray-500">
                or login with provider
            </div>
            <button type="button" onClick = {() => signIn('google', {callbackUrl: '/'})}
            className="flex mt-4 gap-4 justify-center">
                <Image src="/Google.png" alt={''} width={25} height={25} />
                Login with Google
            </button>
            <div className="text-center my-4 text-gray-500 border-t pt-4">
                Existing account? {' '}
                <Link className="underline" href={'/login'}>Login Here &raquo;</Link>
            </div>
        </form>
    </section>
    );
}