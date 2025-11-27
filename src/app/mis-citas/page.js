'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Video } from 'lucide-react';
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
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled, completed
  const [statusFilter, setStatusFilter] = useState('all'); // all, scheduled, confirmed, in-progress, completed, cancelled
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [videoSessions, setVideoSessions] = useState({});

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments', {
        cache: 'no-store',
      });
      const data = await res.json();
      
      if (res.ok) {
        setAppointments(data.appointments);
        // Cargar sesiones de video para citas confirmadas
        await loadVideoSessions(data.appointments);
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVideoSessions = async (appointmentsList) => {
    const sessions = {};
    for (const apt of appointmentsList) {
      if (apt.status === 'confirmed' || apt.status === 'in-progress') {
        try {
          const res = await fetch(`/api/video-sessions?appointmentId=${apt._id}`);
          if (res.ok) {
            const session = await res.json();
            if (session && session._id) {
              sessions[apt._id] = session;
            }
          }
        } catch (err) {
          console.error('Error al cargar sesión:', err);
        }
      }
    }
    setVideoSessions(sessions);
  };

  const handleStartVideoCall = async (appointmentId) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/video-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      });

      if (res.ok) {
        const session = await res.json();
        router.push(`/video-call/${session._id}`);
      } else {
        const data = await res.json();
        alert(data.error || 'Error al iniciar videollamada');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinVideoCall = (sessionId) => {
    router.push(`/video-call/${sessionId}`);
  };

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
      setActionLoading(true);
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
    } finally {
      setActionLoading(false);
    }
  }, [selectedAppointment, cancelReason, loadAppointments]);

  const handleChangeStatus = useCallback(async () => {
    if (!selectedAppointment || !newStatus) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/appointments/${selectedAppointment._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (res.ok) {
        setShowStatusModal(false);
        setNewStatus('');
        setSelectedAppointment(null);
        loadAppointments();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar estado');
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  }, [selectedAppointment, newStatus, loadAppointments]);

  const getFilteredAppointments = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return appointments.filter(apt => {
      let timeMatch = true;
      if (filter === 'upcoming') {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        timeMatch = aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
      } else if (filter === 'past') {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        timeMatch = aptDate < now || apt.status === 'completed';
      } else if (filter === 'cancelled') {
        timeMatch = apt.status === 'cancelled';
      } else if (filter === 'completed') {
        timeMatch = apt.status === 'completed';
      }

      // Filtro por estado
      let statusMatch = true;
      if (statusFilter !== 'all') {
        statusMatch = apt.status === statusFilter;
      }

      return timeMatch && statusMatch;
    });
  }, [appointments, filter, statusFilter]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    // Compensar offset de zona horaria para mostrar fecha correcta
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString('es-ES', {
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {session?.user?.role === 'doctor' ? 'Citas de Mis Pacientes' : 'Mis Citas Médicas'}
            </h1>
            <p className="text-gray-600">
              {session?.user?.role === 'doctor' 
                ? 'Gestiona las citas programadas con tus pacientes' 
                : 'Gestiona y revisa tus citas programadas'}
            </p>
          </div>
          {session?.user?.role !== 'doctor' && (
            <Link
              href="/agendar-cita"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Cita
            </Link>
          )}
        </div>

        {/* Filtros mejorados */}
        <div className="space-y-4 mb-8">
          {/* Filtros por tiempo */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Filtrar por tiempo:</p>
            <div className="flex flex-wrap gap-3">
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
                Próximas ({appointments.filter(a => {
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  return new Date(a.date) >= now && a.status !== 'cancelled' && a.status !== 'completed';
                }).length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:shadow-md'
                }`}
              >
                Completadas ({appointments.filter(a => a.status === 'completed').length})
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${
                  filter === 'cancelled'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:shadow-md'
                }`}
              >
                Canceladas ({appointments.filter(a => a.status === 'cancelled').length})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${
                  filter === 'past'
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                Pasadas
              </button>
            </div>
          </div>

          {/* Filtros por estado */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setStatusFilter('scheduled')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Programadas
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'confirmed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmadas
              </button>
              <button
                onClick={() => setStatusFilter('in-progress')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === 'in-progress'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En Progreso
              </button>
            </div>
          </div>
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
              {session?.user?.role === 'doctor' 
                ? `No tienes citas de pacientes ${filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : filter === 'completed' ? 'completadas' : filter === 'cancelled' ? 'canceladas' : ''}`
                : `No tienes citas ${filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : filter === 'completed' ? 'completadas' : filter === 'cancelled' ? 'canceladas' : ''}`
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {session?.user?.role === 'doctor'
                ? 'Las citas agendadas con tus pacientes aparecerán aquí'
                : 'Agenda tu primera consulta con nuestros especialistas'
              }
            </p>
            {session?.user?.role !== 'doctor' && (
              <Link
                href="/agendar-cita"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agendar mi primera cita
              </Link>
            )}
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
                        <p className="text-xs text-gray-500 font-medium mb-1">
                          {session?.user?.role === 'doctor' ? 'Paciente' : 'Doctor'}
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {session?.user?.role === 'doctor' 
                            ? appointment.patient?.name || appointment.patient?.email
                            : `Dr(a). ${appointment.doctor?.name || appointment.doctor?.email}`
                          }
                        </p>
                        {session?.user?.role === 'doctor' && appointment.patient?.phone && (
                          <p className="text-xs text-gray-500 mt-0.5">{appointment.patient.phone}</p>
                        )}
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
                  
                  {/* Motivo de la consulta */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Motivo de consulta</p>
                    <p className="text-gray-700">{appointment.reason}</p>
                  </div>

                  {/* Información de Videollamada si existe */}
                  {appointment.videoSession && (
                    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-4">
                      <div className="flex items-start gap-3">
                        <Video className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-purple-900 mb-1">
                            Consulta Virtual Realizada
                          </p>
                          <div className="text-xs text-purple-700 space-y-1">
                            <p>
                              📅 Fecha: {new Date(appointment.videoSession.startedAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            <p>
                              🕐 Hora: {new Date(appointment.videoSession.startedAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })} - {new Date(appointment.videoSession.endedAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p>
                              ⏱️ Duración: {appointment.videoSession.duration} minutos
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mensaje de estado para pacientes */}
                  {session?.user?.role !== 'doctor' && (
                    <>
                      {appointment.status === 'scheduled' && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
                          <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tu cita está pendiente de confirmación por el doctor
                          </p>
                        </div>
                      )}
                      {appointment.status === 'confirmed' && (
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-xl p-4">
                          <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ¡Tu cita ha sido confirmada por el doctor!
                          </p>
                        </div>
                      )}
                      {appointment.status === 'in-progress' && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-4">
                          <p className="text-sm text-yellow-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tu consulta está en progreso
                          </p>
                        </div>
                      )}
                      {appointment.status === 'completed' && (
                        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-xl p-4">
                          <p className="text-sm text-purple-700 font-medium flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Consulta completada exitosamente
                          </p>
                        </div>
                      )}
                    </>
                  )}

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
                  {/* Botones para DOCTOR */}
                  {session?.user?.role === 'doctor' && (
                    <>
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setNewStatus('confirmed');
                            setShowStatusModal(true);
                          }}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Confirmar
                        </button>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <>
                          {videoSessions[appointment._id] ? (
                            <button
                              onClick={() => handleJoinVideoCall(videoSessions[appointment._id]._id)}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                              <Video className="w-5 h-5" />
                              Unirse a Consulta
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartVideoCall(appointment._id)}
                              disabled={actionLoading}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                            >
                              <Video className="w-5 h-5" />
                              Iniciar Consulta Virtual
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setNewStatus('completed');
                              setShowStatusModal(true);
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Marcar Completada
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'in-progress' && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setNewStatus('completed');
                            setShowStatusModal(true);
                          }}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Marcar Completada
                        </button>
                      )}
                      
                      {appointment.status === 'completed' && (
                        <Link
                          href={`/doctor/historiales/nuevo?appointmentId=${appointment._id}&patientId=${appointment.patient._id}`}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Crear Historial
                        </Link>
                      )}
                      
                      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
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
                    </>
                  )}
                  
                  {/* Botones para PACIENTE */}
                  {session?.user?.role !== 'doctor' && (
                    <>
                      {/* Botón para unirse a videollamada si hay sesión activa */}
                      {videoSessions[appointment._id] && appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleJoinVideoCall(videoSessions[appointment._id]._id)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                          <Video className="w-5 h-5" />
                          Unirse a Consulta Virtual
                        </button>
                      )}

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
                    </>
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
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sí, cancelar
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedAppointment(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                No, volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de estado */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                newStatus === 'confirmed' ? 'bg-green-100' : 
                newStatus === 'in-progress' ? 'bg-yellow-100' : 
                'bg-blue-100'
              }`}>
                {newStatus === 'confirmed' && (
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {newStatus === 'in-progress' && (
                  <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {newStatus === 'completed' && (
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {newStatus === 'confirmed' && 'Confirmar Cita'}
                {newStatus === 'in-progress' && 'Iniciar Consulta'}
                {newStatus === 'completed' && 'Completar Cita'}
              </h3>
              <p className="text-gray-600">
                {newStatus === 'confirmed' && '¿Confirmar que esta cita está programada y el paciente será atendido?'}
                {newStatus === 'in-progress' && '¿Iniciar la consulta con el paciente ahora?'}
                {newStatus === 'completed' && '¿Marcar esta cita como completada? Esta acción es permanente.'}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleChangeStatus}
                disabled={actionLoading}
                className={`flex-1 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                  newStatus === 'confirmed' ? 'bg-green-500 hover:bg-green-600' :
                  newStatus === 'in-progress' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sí, continuar
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus('');
                  setSelectedAppointment(null);
                }}
                disabled={actionLoading}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
