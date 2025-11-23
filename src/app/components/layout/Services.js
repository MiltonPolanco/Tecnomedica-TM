// src/app/components/layout/Services.js
import { Video, Stethoscope, Clock, Smartphone, FileText, Shield } from "lucide-react";

const items = [
  {
    icon: Video,
    title: "Videoconsulta HD",
    desc: "Habla con tu doctor en tiempo real con video de alta calidad.",
    color: "bg-blue-50 text-blue-600",
    hoverColor: "group-hover:bg-blue-600"
  },
  {
    icon: Stethoscope,
    title: "Especialistas",
    desc: "Acceso a médicos certificados de múltiples especialidades.",
    color: "bg-purple-50 text-purple-600",
    hoverColor: "group-hover:bg-purple-600"
  },
  {
    icon: Clock,
    title: "Sin Esperas",
    desc: "Agenda tu cita y conéctate puntualmente sin largas esperas.",
    color: "bg-green-50 text-green-600",
    hoverColor: "group-hover:bg-green-600"
  },
  {
    icon: FileText,
    title: "Historial Médico",
    desc: "Accede a tu historial y recetas desde cualquier lugar.",
    color: "bg-orange-50 text-orange-600",
    hoverColor: "group-hover:bg-orange-600"
  },
  {
    icon: Shield,
    title: "Privacidad Total",
    desc: "Tus datos médicos protegidos con encriptación de última generación.",
    color: "bg-red-50 text-red-600",
    hoverColor: "group-hover:bg-red-600"
  },
  {
    icon: Smartphone,
    title: "Multi-dispositivo",
    desc: "Accede desde tu computadora, tablet o smartphone.",
    color: "bg-cyan-50 text-cyan-600",
    hoverColor: "group-hover:bg-cyan-600"
  },
];

export default function Services() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
            Servicios que marcan la diferencia
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tecnología de vanguardia combinada con atención médica profesional
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="group relative p-8 bg-white rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`inline-flex p-4 rounded-xl ${s.color} ${s.hoverColor} transition-colors mb-5`}>
                  <Icon className="w-8 h-8 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {s.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {s.desc}
                </p>
                
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">
              ¿Listo para tu primera consulta?
            </h3>
            <p className="text-blue-100 mb-6">
              Únete a miles de pacientes satisfechos con nuestra plataforma
            </p>
            <a
              href="/agendar-cita"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Comenzar Ahora
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
