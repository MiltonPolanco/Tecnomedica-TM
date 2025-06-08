'use client';
import React from 'react';
import { FaStethoscope, FaHeartbeat, FaPrescriptionBottleAlt, FaNotesMedical, FaUserMd } from 'react-icons/fa';

const doctorServices = [
  {
    icon: <FaUserMd size={36} className="text-primary mb-4" />,
    title: 'Consulta General',
    desc: 'Evaluación médica integral para diagnóstico y tratamiento.',
  },
  {
    icon: <FaHeartbeat size={36} className="text-primary mb-4" />,
    title: 'Monitoreo Crónico',
    desc: 'Seguimiento de enfermedades crónicas como diabetes o hipertensión.',
  },
  {
    icon: <FaPrescriptionBottleAlt size={36} className="text-primary mb-4" />,
    title: 'Recetas Médicas',
    desc: 'Emisión de recetas y renovaciones desde la plataforma.',
  },
  {
    icon: <FaNotesMedical size={36} className="text-primary mb-4" />,
    title: 'Asesoría Nutricional',
    desc: 'Planes de alimentación personalizados con profesionales.',
  },
  {
    icon: <FaStethoscope size={36} className="text-primary mb-4" />,
    title: 'Psicología',
    desc: 'Apoyo emocional y terapias con psicólogos licenciados.',
  },
];

export default function ServicesPage() {
  return (
    <main className="max-w-5xl mx-auto my-12 px-4">
      <h1 className="text-4xl font-semibold text-center mb-12">
        Tipos de Servicios Médicos
      </h1>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {doctorServices.map((svc, idx) => (
          <div
            key={idx}
            className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition text-center"
          >
            {svc.icon}
            <h2 className="text-2xl font-medium mb-2">{svc.title}</h2>
            <p className="text-gray-600 text-sm">{svc.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
