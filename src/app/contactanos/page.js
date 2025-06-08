'use client';
import React, { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="max-w-3xl mx-auto my-12 p-4 space-y-8">
      <h1 className="text-4xl font-semibold text-center">Contáctanos</h1>
      <p className="text-gray-600 text-center">
        ¿Tienes dudas o deseas más información? Déjanos un mensaje y te responderemos
        a la brevedad.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:bg-blue-600 transition"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
        </button>

        {status === 'success' && (
          <p className="text-green-600 text-center">Mensaje enviado exitosamente.</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-center">Error al enviar. Intenta de nuevo.</p>
        )}
      </form>

      <section className="pt-12 border-t">
        <h2 className="text-2xl font-semibold mb-4">Visítanos</h2>
        <p className="text-gray-700">Asunción Mita, Jutiapa, Guatemala</p>
        <p className="text-gray-700">Tel: +502 4224-4883</p>
        <p className="text-gray-700">Email: clinicatecnomedica@gmail.com</p>
      </section>
    </main>
  )
}
