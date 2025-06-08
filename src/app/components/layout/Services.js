// src/app/components/layout/Services.js
import React from "react";
import { FaVideo, FaUserMd, FaClock, FaMobileAlt } from "react-icons/fa";

const items = [
  {
    icon: <FaVideo size={36} className="text-primary" />,
    title: "Vídeo consulta",
    desc: "Habla con tu doctor en tiempo real desde cualquier lugar.",
  },
  {
    icon: <FaUserMd size={36} className="text-primary" />,
    title: "Especialistas",
    desc: "Acceso a médicos de múltiples especialidades.",
  },
  {
    icon: <FaClock size={36} className="text-primary" />,
    title: "24/7 Disponibilidad",
    desc: "Consulta médica cuando más lo necesites.",
  },
  {
    icon: <FaMobileAlt size={36} className="text-primary" />,
    title: "App Móvil",
    desc: "Gestiona tus citas desde tu smartphone.",
  },
];

export default function Services() {
  return (
    <section className="mt-10">
      <h2 className="text-3xl font-semibold text-center mb-12">
        Nuestros Servicios
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => (
          <div
            key={i}
            className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-center"
          >
            <div className="mb-4">{s.icon}</div>
            <h3 className="text-xl font-medium mb-2">{s.title}</h3>
            <p className="text-gray-500 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
