'use client';
import Image from 'next/image';
import React from 'react';

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto my-12 px-4 space-y-12">
      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Sobre Nosotros</h1>
        <p className="text-gray-600">
          En Tecnomédica de Guatemala, brindamos atención médica de calidad a
          través de telemedicina, respaldados por décadas de experiencia.
        </p>
      </section>

      {/* Doctor Profile */}
      <section className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/3 flex justify-center">
          <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        <div className="w-full lg:w-2/3 space-y-4">
          <h2 className="text-2xl font-semibold">
            Dr. Milton Polanco
          </h2>
          <p className="text-gray-700">
            Médico General con más de <span className="font-medium">35 años</span> de experiencia atendiendo a pacientes en
            Guatemala. Especializado en diagnóstico por rayos X, consultas
            generales y manejo de enfermedades crónicas.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Atención presencial y telemedicina.</li>
            <li>Diagnóstico con equipo de rayos X.</li>
            <li>Más de 5,000 pacientes satisfechos.</li>
            <li>Asesoría en nutrición y estilos de vida saludables.</li>
          </ul>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Nuestra Misión</h2>
        <p className="text-gray-600 text-center">
          Facilitar el acceso a servicios médicos de primera calidad en toda Guatemala,
          combinando tecnología y la experiencia de nuestro equipo.
        </p>
        <h2 className="text-2xl font-semibold text-center">Nuestros Valores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Empatía</h3>
            <p className="text-gray-600 text-sm">
              Ponemos a nuestros pacientes en el centro de cada consulta.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Profesionalismo</h3>
            <p className="text-gray-600 text-sm">
              Más de tres décadas manteniendo los más altos estándares médicos.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Innovación</h3>
            <p className="text-gray-600 text-sm">
              Utilizamos tecnología de vanguardia para diagnósticos y consultas.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Confidencialidad</h3>
            <p className="text-gray-600 text-sm">
              Protección absoluta de la información y privacidad del paciente.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
