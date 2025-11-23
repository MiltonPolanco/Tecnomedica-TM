'use client';
import React from 'react';
import { Award, Users, Heart, Shield, Clock, Star } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre Nosotros
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Más de 35 años brindando atención médica de calidad en Guatemala
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Image/Visual */}
            <div className="relative">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-12 flex items-center justify-center">
                  <div className="w-full max-w-sm aspect-square bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">35+</div>
                      <div className="text-xl">Años de experiencia</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                Nuestra Historia
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Dr. Milton Polanco
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Médico General con más de <span className="font-semibold text-blue-600">35 años</span> de experiencia 
                atendiendo a pacientes en Guatemala. Especializado en diagnóstico por rayos X, consultas 
                generales y manejo de enfermedades crónicas.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Certificado</h4>
                    <p className="text-sm text-gray-600">Médico General Licenciado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">5,000+ Pacientes</h4>
                    <p className="text-sm text-gray-600">Atendidos con éxito</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Telemedicina</h4>
                    <p className="text-sm text-gray-600">Atención presencial y virtual</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Rayos X</h4>
                    <p className="text-sm text-gray-600">Equipo de diagnóstico</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h2>
              <p className="text-gray-600 leading-relaxed">
                Facilitar el acceso a servicios médicos de primera calidad en toda Guatemala,
                combinando tecnología moderna con la experiencia de nuestro equipo médico para
                brindar atención personalizada y eficiente.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h2>
              <p className="text-gray-600 leading-relaxed">
                Ser la plataforma líder de telemedicina en Guatemala, reconocida por la excelencia
                en atención médica, innovación tecnológica y compromiso con la salud de nuestros
                pacientes.
              </p>
            </div>
          </div>

          {/* Values Grid */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Nuestros Valores
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Empatía</h3>
                <p className="text-gray-600 text-sm">
                  Ponemos a nuestros pacientes en el centro de cada consulta
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Profesionalismo</h3>
                <p className="text-gray-600 text-sm">
                  Más de tres décadas manteniendo los más altos estándares médicos
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Innovación</h3>
                <p className="text-gray-600 text-sm">
                  Utilizamos tecnología de vanguardia para diagnósticos y consultas
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Confidencialidad</h3>
                <p className="text-gray-600 text-sm">
                  Protección absoluta de la información y privacidad del paciente
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para cuidar tu salud?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Agenda tu primera consulta y experimenta la calidad de nuestro servicio
          </p>
          <a
            href="/agendar-cita"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Agendar Cita Ahora
          </a>
        </div>
      </section>
    </main>
  );
}
