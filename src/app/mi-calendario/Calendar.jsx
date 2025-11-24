"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Calendar from "react-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import "react-calendar/dist/Calendar.css";
import "./calendar-enhanced.css";
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "@/constants/appointments";

export default function MiCalendarStyled() {
  const { data: session, status } = useSession();
  const [date, setDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar citas desde la API
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments', {
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (res.ok) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      loadAppointments();
    }
  }, [status, loadAppointments]);

  const events = useMemo(() => {
    const eventsMap = {};
    
    appointments.forEach(apt => {
      const aptDate = new Date(apt.date);
      const localDate = new Date(aptDate.getTime() + aptDate.getTimezoneOffset() * 60000);
      const dateKey = localDate.toISOString().split('T')[0];
      
      if (!eventsMap[dateKey]) {
        eventsMap[dateKey] = [];
      }
      
      eventsMap[dateKey].push({
        id: apt._id,
        title: APPOINTMENT_TYPE_LABELS[apt.type] || apt.type,
        time: apt.startTime,
        doctor: apt.doctor?.name || apt.doctor?.email,
        patient: apt.patient?.name || apt.patient?.email,
        patientPhone: apt.patient?.phone,
        specialty: apt.specialty,
        status: apt.status,
        reason: apt.reason,
      });
    });
    
    return eventsMap;
  }, [appointments]);

  const selectedDateEvents = useMemo(() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    return events[dateKey] || [];
  }, [date, events]);

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

  if (status === 'loading' || loading) {
    return <LoadingSpinner size="lg" message="Cargando calendario..." />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">Debes iniciar sesión para ver tu calendario</p>
          <Link href="/login" className="bg-primary text-white px-6 py-3 rounded-lg">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-8 px-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-800 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-semibold">Mi Calendario</h2>
              <p className="mt-1">
                {session?.user?.role === 'doctor' 
                  ? 'Citas con tus pacientes' 
                  : 'Tus citas médicas'}
              </p>
            </div>
            {session?.user?.role !== 'doctor' && (
              <Link
                href="/agendar-cita"
                className="bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                + Nueva Cita
              </Link>
            )}
          </div>
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
                  if (events[key] && events[key].length > 0) {
                    return (
                      <div className="dots">
                        {events[key].slice(0, 3).map((_, i) => (
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
            <p className="text-xl text-gray-700 font-semibold mb-2">
              {date.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            
            {selectedDateEvents.length > 0 ? (
              <div className="mt-4 space-y-3">
                <p className="font-medium text-gray-700">
                  Citas del día ({selectedDateEvents.length}):
                </p>
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border-l-4 border-primary pl-3 py-2 bg-blue-50 rounded"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {event.time} - {event.title}
                        </p>
                        {session?.user?.role === 'doctor' ? (
                          <>
                            <p className="text-sm text-gray-600">
                              <strong>Paciente:</strong> {event.patient}
                            </p>
                            {event.patientPhone && (
                              <p className="text-sm text-gray-600">
                                <strong>Tel:</strong> {event.patientPhone}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              <strong>Especialidad:</strong> {event.specialty}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">
                              <strong>Doctor:</strong> {event.doctor}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Especialidad:</strong> {event.specialty}
                            </p>
                          </>
                        )}
                        {event.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.reason}
                          </p>
                        )}
                        <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${APPOINTMENT_STATUS_COLORS[event.status]}`}>
                          {APPOINTMENT_STATUS_LABELS[event.status]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/mis-citas"
                  className="block text-center text-primary hover:text-blue-600 font-medium mt-4"
                >
                  Ver todas mis citas →
                </Link>
              </div>
            ) : (
              <div className="mt-4 text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 mb-3">
                  {session?.user?.role === 'doctor' 
                    ? 'No tienes citas con pacientes este día' 
                    : 'No tienes citas este día'}
                </p>
                {session?.user?.role !== 'doctor' && (
                  <Link
                    href="/agendar-cita"
                    className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                  >
                    Agendar cita
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
