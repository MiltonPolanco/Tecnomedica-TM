// src/app/components/layout/Hero.js
import Image from "next/image";
import React from "react";

export default function Hero() {
  return (
    <section className="hero grid grid-cols-1 lg:grid-cols-2 items-center gap-8 py-14">
      <div className="space-y-6">
        <h1 className="text-5xl font-extrabold leading-tight">
          Telemedicina <span className="text-primary">para todos</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-prose">
          Conecta con médicos especialistas desde la comodidad de tu hogar, sin
          esperas ni desplazamientos.
        </p>
        <button className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition">
          Agendar mi cita
        </button>
      </div>
      <div className="relative w-full h-64 lg:h-80">
        <Image
          src="/LogoTecnomedica.png"
          fill
          objectFit="contain"
          alt="Logo Tecnomedica"
        />
      </div>
    </section>
  );
}
