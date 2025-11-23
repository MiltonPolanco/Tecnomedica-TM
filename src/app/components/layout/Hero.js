// src/app/components/layout/Hero.js
import Image from "next/image";
import Link from "next/link";
import { Calendar, Video, Clock, Shield } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 py-16 lg:py-24">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  ✨ Atención médica digital
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Telemedicina{" "}
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  profesional
                </span>
                <br />
                a tu alcance
              </h1>
              <p className="text-gray-600 text-lg lg:text-xl max-w-2xl">
                Conecta con médicos especialistas desde la comodidad de tu hogar. 
                Consultas por videollamada sin esperas ni desplazamientos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/agendar-cita"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5" />
                Agendar Cita Ahora
              </Link>
              <Link 
                href="/servicios"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                Ver Servicios
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-blue-600">5,000+</div>
                <div className="text-sm text-gray-600">Pacientes</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-blue-600">35+</div>
                <div className="text-sm text-gray-600">Años</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-sm text-gray-600">Disponible</div>
              </div>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl transform rotate-3"></div>
              <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
                <Image
                  src="/LogoTecnomedica.png"
                  width={400}
                  height={400}
                  style={{ objectFit: "contain" }}
                  alt="Logo Tecnomédica"
                  priority
                  className="max-w-full max-h-full"
                />
              </div>
            </div>

            {/* Floating cards */}
            <div className="hidden lg:block">
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-bounce">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Videoconsulta</div>
                  <div className="text-xs text-gray-500">HD Quality</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">100% Seguro</div>
                  <div className="text-xs text-gray-500">Datos protegidos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
