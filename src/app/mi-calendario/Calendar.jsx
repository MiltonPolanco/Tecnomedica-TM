"use client";

import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import "./calendar-enhanced.css";

export default function MiCalendarStyled() {
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());

  const events = {
    "2025-04-10": ["Cita médica"],
    "2025-04-15": ["Vacunación", "Examen"],
    "2025-04-29": ["Cumpleaños"],
  };

  const monthNames = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) =>
        new Date(0, i).toLocaleString("es-ES", { month: "long" })
      ),
    []
  );
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => new Date().getFullYear() - 7 + i),
    []
  );

  const goToToday = () => {
    const today = new Date();
    setDate(today);
    setActiveStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div className="flex justify-center pt-8 px-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 text-white p-6">
          <h2 className="text-3xl font-semibold">Mi Agenda</h2>
          <p className="mt-1">Planifica tu mes</p>
        </div>

        {/* Controles: Mes | Año | Hoy */}
        <div className="p-6 flex items-center gap-3 flex-nowrap">
          <select
            className="flex-none border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={activeStartDate.getMonth()}
            onChange={(e) =>
              setActiveStartDate(
                new Date(
                  activeStartDate.getFullYear(),
                  parseInt(e.target.value, 10),
                  1
                )
              )
            }
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="flex-none border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={activeStartDate.getFullYear()}
            onChange={(e) =>
              setActiveStartDate(
                new Date(
                  parseInt(e.target.value, 10),
                  activeStartDate.getMonth(),
                  1
                )
              )
            }
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={goToToday}
            className="flex-none w-[270px] bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          >
            Hoy
          </button>
        </div>

        {/* Calendario + Panel de detalles */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              onChange={(d) => {
                setDate(d);
                setActiveStartDate(new Date(d.getFullYear(), d.getMonth(), 1));
              }}
              value={date}
              locale="es-ES"
              activeStartDate={activeStartDate}
              onActiveStartDateChange={({ activeStartDate }) =>
                setActiveStartDate(activeStartDate)
              }
              minDetail="month"
              maxDetail="month"
              formatMonthYear={(locale, date) =>
                date
                  .toLocaleDateString(locale, {
                    month: "long",
                    year: "numeric",
                  })
                  .toUpperCase()
              }
              prevLabel={<ChevronLeft size={24} />}
              nextLabel={<ChevronRight size={24} />}
              prev2Label={null}
              next2Label={null}
              showNeighboringMonth={false}
              className="calendar"
              tileClassName={({ date: d, view }) => {
                if (view !== "month") return "";
                if (d.toDateString() === date.toDateString()) return "selected";
                if (d.getDay() === 0 || d.getDay() === 6) return "weekend";
                return "";
              }}
              tileContent={({ date: d, view }) => {
                if (view === "month") {
                  const key = d.toISOString().split("T")[0];
                  if (events[key]) {
                    return (
                      <div className="dots">
                        {events[key].map((_, i) => (
                          <span key={i} />
                        ))}
                      </div>
                    );
                  }
                }
              }}
            />
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-xl text-gray-700">Fecha seleccionada:</p>
            <p className="mt-2 text-2xl font-semibold text-blue-800">
              {date.toLocaleDateString()}
            </p>
            {events[date.toISOString().split("T")[0]] && (
              <div className="mt-4">
                <p className="font-medium">Eventos:</p>
                <ul className="list-disc list-inside text-gray-600">
                  {events[date.toISOString().split("T")[0]].map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
