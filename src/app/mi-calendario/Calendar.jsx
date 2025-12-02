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
      // Extraer solo la fecha en formato YYYY-MM-DD sin conversión de zona horaria
      const dateStr = apt.date.split('T')[0];
      
      if (!eventsMap[dateStr]) {
        eventsMap[dateStr] = [];
      }
      
      eventsMap[dateStr].push({
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

  // Estadísticas del mes actual
  const monthStats = useMemo(() => {
    const currentMonth = activeStartDate.getMonth();
    const currentYear = activeStartDate.getFullYear();
    
    const monthAppointments = appointments.filter(apt => {
      const [year, month] = apt.date.split('T')[0].split('-');
      return parseInt(year) === currentYear && parseInt(month) - 1 === currentMonth;
    });

    return {
      total: monthAppointments.length,
      scheduled: monthAppointments.filter(a => a.status === 'scheduled').length,
      confirmed: monthAppointments.filter(a => a.status === 'confirmed').length,
      completed: monthAppointments.filter(a => a.status === 'completed').length,
      cancelled: monthAppointments.filter(a => a.status === 'cancelled').length,
    };
  }, [appointments, activeStartDate]);

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
          <div className="flex justify-between items-center mb-4">
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
          
          {/* Estadísticas del mes */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            <div className="bg-blue-700 bg-opacity-50 rounded-lg p-3">
              <p className="text-blue-200 text-xs font-medium">Total</p>
              <p className="text-2xl font-bold">{monthStats.total}</p>
            </div>
            <div className="bg-blue-600 bg-opacity-50 rounded-lg p-3">
              <p className="text-blue-200 text-xs font-medium">Programadas</p>
              <p className="text-2xl font-bold">{monthStats.scheduled}</p>
            </div>
            <div className="bg-green-600 bg-opacity-70 rounded-lg p-3">
              <p className="text-green-100 text-xs font-medium">Confirmadas</p>
              <p className="text-2xl font-bold">{monthStats.confirmed}</p>
            </div>
            <div className="bg-emerald-600 bg-opacity-70 rounded-lg p-3">
              <p className="text-emerald-100 text-xs font-medium">Completadas</p>
              <p className="text-2xl font-bold">{monthStats.completed}</p>
            </div>
            <div className="bg-red-600 bg-opacity-70 rounded-lg p-3">
              <p className="text-red-100 text-xs font-medium">Canceladas</p>
              <p className="text-2xl font-bold">{monthStats.cancelled}</p>
            </div>
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
          <div className="space-y-4">
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
                const key = d.toISOString().split("T")[0];
                const dayEvents = events[key] || [];
                
                // Clases para días con citas
                let classes = "";
                if (d.toDateString() === date.toDateString()) classes += " selected";
                if (d.getDay() === 0 || d.getDay() === 6) classes += " weekend";
                
                // Agregar indicador visual para días con citas
                if (dayEvents.length > 0) {
                  const hasConfirmed = dayEvents.some(e => e.status === 'confirmed');
                  const hasScheduled = dayEvents.some(e => e.status === 'scheduled');
                  const hasCancelled = dayEvents.some(e => e.status === 'cancelled');
                  
                  if (hasConfirmed) classes += " has-confirmed-appointment";
                  else if (hasScheduled) classes += " has-scheduled-appointment";
                  else if (hasCancelled) classes += " has-cancelled-appointment";
                }
                
                return classes.trim();
              }}
              tileContent={({ date: d, view }) => {
                if (view === "month") {
                  const key = d.toISOString().split("T")[0];
                  const dayEvents = events[key] || [];
                  
                  if (dayEvents.length > 0) {
                    return (
                      <div className="tile-content">
                        <div className="dots">
                          {dayEvents.slice(0, 3).map((_, i) => (
                            <span key={i} />
                          ))}
                        </div>
                        {dayEvents.length > 3 && (
                          <span className="more-indicator">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    );
                  }
                }
              }}
            />
            
            {/* Leyenda del calendario */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Leyenda</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border-2 border-green-500 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Hoy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Seleccionado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Confirmadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Programadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-50 border border-red-200 rounded flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-600">Canceladas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-semibold text-base">S D</span>
                  <span className="text-gray-600">Fines de semana</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl shadow-inner p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {date.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              {selectedDateEvents.length > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'cita' : 'citas'}
                </span>
              )}
            </div>
            
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white border-l-4 border-blue-600 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold text-gray-900 text-lg">{event.time}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${APPOINTMENT_STATUS_COLORS[event.status]}`}>
                            {APPOINTMENT_STATUS_LABELS[event.status]}
                          </span>
                        </div>
                        
                        <p className="font-semibold text-gray-800 mb-1">
                          {event.title}
                        </p>
                        
                        {session?.user?.role === 'doctor' ? (
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <strong>Paciente:</strong> {event.patient}
                            </p>
                            {event.patientPhone && (
                              <p className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {event.patientPhone}
                              </p>
                            )}
                            <p className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <strong>Especialidad:</strong> {event.specialty}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <strong>Doctor:</strong> {event.doctor}
                            </p>
                            <p className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <strong>Especialidad:</strong> {event.specialty}
                            </p>
                          </div>
                        )}
                        
                        {event.reason && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700 border border-gray-200">
                            <p className="font-medium text-gray-800 mb-1">Motivo:</p>
                            <p>{event.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link
                  href="/mis-citas"
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mt-4"
                >
                  Ver todas mis citas →
                </Link>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 font-medium mb-4">
                  {session?.user?.role === 'doctor' 
                    ? 'No tienes citas con pacientes este día' 
                    : 'No tienes citas este día'}
                </p>
                {session?.user?.role !== 'doctor' && (
                  <Link
                    href="/agendar-cita"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
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
