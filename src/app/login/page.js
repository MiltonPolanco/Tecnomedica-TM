'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from "react";
import { signIn } from 'next-auth/react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginInProgress, setLoginInProgress] = useState(false);

   async function handleFormSubmit(ev) {
        ev.preventDefault();
        setLoginInProgress(true);

        await signIn('credentials', { email, password, callbackUrl: '/'});

        setLoginInProgress(false);
    }
    return (
<section className="mt-8">
        <h1 className="text-center text-primary text-4x1 mb-4">
            Login
        </h1>
        <form className="block max-w-xs mx-auto" onSubmit={handleFormSubmit} >
            <input type="email" name="email" placeholder="Email" value={email}
                    disabled={loginInProgress}
                    onChange={ev => setEmail(ev.target.value)} />
            <input type="password" name="password" placeholder="Password" value={password}
                    disabled={loginInProgress}
                    onChange={ev => setPassword(ev.target.value)}/>
            <button disabled={loginInProgress} type="submit"> Login </button>
            <div className="my-4 text-center text-gray-500">
                or login with provider
            </div>
            <button type="button" onClick = {() => signIn('google', {callbackUrl: '/'})}
            className="flex mt-4 gap-4 justify-center">
                <Image src="/Google.png" alt={''} width={25} height={25} />
                Login with Google
            </button>
        </form>
    </section>


    );
}