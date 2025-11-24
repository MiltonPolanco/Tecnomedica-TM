'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { 
  APPOINTMENT_STATUS_LABELS, 
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TYPE_LABELS 
} from '@/constants/appointments';

export default function MisCitasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadAppointments();
    }
  }, [status, router, loadAppointments]);

  const handleCancelAppointment = useCallback(async () => {
    if (!selectedAppointment || !cancelReason.trim()) {
      alert('Por favor indica el motivo de la cancelación');
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancelReason,
        }),
      });

      if (res.ok) {
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al cancelar cita');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  }, [selectedAppointment, cancelReason, loadAppointments]);

  const getFilteredAppointments = useMemo(() => {
    const now = new Date();
    
    return appointments.filter(apt => {
      if (filter === 'upcoming') {
        return new Date(apt.date) >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
      } else if (filter === 'past') {
        return new Date(apt.date) < now || apt.status === 'completed';
      }
      return true;
    });
  }, [appointments, filter]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  if (status === 'loading' || loading) {
    return <LoadingSpinner size="lg" message="Cargando tus citas..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Mis Citas Médicas</h1>
            <p className="text-gray-600">Gestiona y revisa tus citas programadas</p>
          </div>
          <Link
            href="/agendar-cita"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Cita
          </Link>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            Todas ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${
              filter === 'upcoming'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${
              filter === 'past'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            Pasadas
          </button>
        </div>

      {/* Lista de citas */}
      {getFilteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No tienes citas {filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : ''}
            </h3>
            <p className="text-gray-600 mb-6">
              Agenda tu primera consulta con nuestros especialistas
            </p>
            <Link
              href="/agendar-cita"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agendar mi primera cita
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {getFilteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  {/* Header con tipo y estado */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {APPOINTMENT_TYPE_LABELS[appointment.type]}
                    </h3>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}>
                      {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </span>
                  </div>
                  
                  {/* Información de la cita */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Especialidad</p>
                        <p className="text-gray-900 font-semibold">{appointment.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Doctor</p>
                        <p className="text-gray-900 font-semibold">Dr(a). {appointment.doctor?.name || appointment.doctor?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Fecha</p>
                        <p className="text-gray-900 font-semibold">{formatDate(appointment.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Hora</p>
                        <p className="text-gray-900 font-semibold">{appointment.startTime} - {appointment.endTime}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Motivo */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Motivo de consulta</p>
                    <p className="text-gray-700">{appointment.reason}</p>
                  </div>

                  {appointment.notes && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-xs text-blue-600 font-medium mb-1">Notas</p>
                      <p className="text-gray-700">{appointment.notes}</p>
                    </div>
                  )}

                  {appointment.status === 'cancelled' && appointment.cancelReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                      <p className="text-xs text-red-600 font-medium mb-1">Motivo de cancelación</p>
                      <p className="text-red-700">{appointment.cancelReason}</p>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex lg:flex-col gap-3 lg:items-end">
                  {appointment.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowCancelModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </button>
                  )}
                  
                  {appointment.meetingLink && appointment.status === 'confirmed' && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Unirse
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Cancelar Cita</h3>
              <p className="text-gray-600">
                ¿Estás seguro que deseas cancelar esta cita? Por favor indica el motivo:
              </p>
            </div>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo de la cancelación..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-6 transition-all"
            />
            <div className="flex gap-4">
              <button
                onClick={handleCancelAppointment}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Sí, cancelar
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedAppointment(null);
                }}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                No, volver
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
