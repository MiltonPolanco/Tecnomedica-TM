'use client';
import React from 'react';
import { Stethoscope, Activity, Pill, ClipboardList, Brain, Calendar, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

const doctorServices = [
  {
    icon: Stethoscope,
    title: 'Consulta General',
    desc: 'Evaluación médica integral para diagnóstico y tratamiento de enfermedades comunes.',
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'hover:border-blue-300'
  },
  {
    icon: Activity,
    title: 'Monitoreo Crónico',
    desc: 'Seguimiento continuo de enfermedades crónicas como diabetes, hipertensión y más.',
    color: 'bg-red-50 text-red-600',
    borderColor: 'hover:border-red-300'
  },
  {
    icon: Pill,
    title: 'Recetas Médicas',
    desc: 'Emisión de recetas digitales y renovaciones desde la plataforma.',
    color: 'bg-green-50 text-green-600',
    borderColor: 'hover:border-green-300'
  },
  {
    icon: ClipboardList,
    title: 'Asesoría Nutricional',
    desc: 'Planes de alimentación personalizados con nutricionistas profesionales.',
    color: 'bg-orange-50 text-orange-600',
    borderColor: 'hover:border-orange-300'
  },
  {
    icon: Brain,
    title: 'Psicología',
    desc: 'Apoyo emocional y terapias con psicólogos licenciados especializados.',
    color: 'bg-purple-50 text-purple-600',
    borderColor: 'hover:border-purple-300'
  },
  {
    icon: Calendar,
    title: 'Citas Programadas',
    desc: 'Agenda tus consultas con anticipación y recibe recordatorios automáticos.',
    color: 'bg-cyan-50 text-cyan-600',
    borderColor: 'hover:border-cyan-300'
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Sin esperas',
    desc: 'Consulta en el horario exacto de tu cita'
  },
  {
    icon: Shield,
    title: '100% Seguro',
    desc: 'Tus datos médicos protegidos'
  },
  {
    icon: Stethoscope,
    title: 'Profesionales',
    desc: 'Médicos certificados y experimentados'
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Servicios Médicos Completos
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Atención médica profesional desde la comodidad de tu hogar. 
            Más de 35 años de experiencia respaldándonos.
          </p>
          <Link 
            href="/agendar-cita"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Calendar className="w-5 h-5" />
            Agendar Cita Ahora
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestras Especialidades
            </h2>
            <p className="text-gray-600 text-lg">
              Servicios médicos integrales para cuidar tu salud
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {doctorServices.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={idx}
                  className={`group bg-white p-8 rounded-2xl border-2 border-gray-100 ${svc.borderColor} shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1`}
                >
                  <div className={`inline-flex p-4 rounded-xl ${svc.color} mb-5`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {svc.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {svc.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Tecnomédica?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para tu consulta?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Agenda tu cita ahora y recibe atención médica profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/agendar-cita"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
              >
                Agendar Cita
              </Link>
              <Link
                href="/contactanos"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
