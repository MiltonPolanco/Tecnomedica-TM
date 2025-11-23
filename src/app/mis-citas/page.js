'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      loadAppointments();
    }
  }, [status, router]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments');
      const data = await res.json();
      
      if (res.ok) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
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
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    
    return appointments.filter(apt => {
      if (filter === 'upcoming') {
        return new Date(apt.date) >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
      } else if (filter === 'past') {
        return new Date(apt.date) < now || apt.status === 'completed';
      }
      return true;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando tus citas...</div>
      </div>
    );
  }

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Mis Citas Médicas</h1>
        <Link
          href="/agendar-cita"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium"
        >
          + Nueva Cita
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todas ({appointments.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'upcoming'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'past'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pasadas
        </button>
      </div>

      {/* Lista de citas */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl text-gray-600 mb-4">No tienes citas {filter === 'upcoming' ? 'próximas' : filter === 'past' ? 'pasadas' : ''}</p>
          <Link
            href="/agendar-cita"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Agendar mi primera cita
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white border rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">
                      {APPOINTMENT_TYPE_LABELS[appointment.type]}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${APPOINTMENT_STATUS_COLORS[appointment.status]}`}>
                      {APPOINTMENT_STATUS_LABELS[appointment.status]}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">
                    <strong>Especialidad:</strong> {appointment.specialty}
                  </p>
                  
                  <p className="text-gray-600 mb-2">
                    <strong>Doctor:</strong> Dr(a). {appointment.doctor?.name || appointment.doctor?.email}
                  </p>
                  
                  <p className="text-gray-600 mb-2">
                    <strong>Fecha:</strong> {formatDate(appointment.date)}
                  </p>
                  
                  <p className="text-gray-600 mb-2">
                    <strong>Hora:</strong> {appointment.startTime} - {appointment.endTime}
                  </p>
                  
                  <p className="text-gray-600">
                    <strong>Motivo:</strong> {appointment.reason}
                  </p>

                  {appointment.notes && (
                    <p className="text-gray-600 mt-2">
                      <strong>Notas:</strong> {appointment.notes}
                    </p>
                  )}

                  {appointment.status === 'cancelled' && appointment.cancelReason && (
                    <p className="text-red-600 mt-2">
                      <strong>Motivo de cancelación:</strong> {appointment.cancelReason}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {appointment.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowCancelModal(true);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      Cancelar
                    </button>
                  )}
                  
                  {appointment.meetingLink && appointment.status === 'confirmed' && (
                    <a
                      href={appointment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm text-center"
                    >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cancelar Cita</h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro que deseas cancelar esta cita? Por favor indica el motivo:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo de la cancelación..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={handleCancelAppointment}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Sí, cancelar
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedAppointment(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                No, volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
