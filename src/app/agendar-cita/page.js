'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SPECIALTIES, AVAILABLE_TIME_SLOTS, APPOINTMENT_TYPE_LABELS, APPOINTMENT_TYPES } from '@/constants/appointments';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function AgendarCitaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    specialty: '',
    doctorId: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'consultation',
    reason: '',
  });
  
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Cargar doctores cuando se selecciona especialidad
  useEffect(() => {
    if (formData.specialty) {
      loadDoctors(formData.specialty);
    } else {
      setDoctors([]);
      setFormData(prev => ({ ...prev, doctorId: '', date: '', startTime: '', endTime: '' }));
    }
  }, [formData.specialty]);

  // Cargar disponibilidad cuando se selecciona doctor y fecha
  useEffect(() => {
    if (formData.doctorId && formData.date) {
      loadAvailability();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, startTime: '', endTime: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.doctorId, formData.date]);

  // Auto-calcular endTime basado en el slot seleccionado
  useEffect(() => {
    if (formData.startTime && availableSlots.length > 0) {
      const selectedSlot = availableSlots.find(slot => slot.startTime === formData.startTime);
      if (selectedSlot) {
        setFormData(prev => ({
          ...prev,
          endTime: selectedSlot.endTime
        }));
      }
    }
  }, [formData.startTime, availableSlots]);

  const loadDoctors = async (specialty) => {
    try {
      const res = await fetch(`/api/doctors?specialty=${encodeURIComponent(specialty)}`);
      const data = await res.json();
      
      if (res.ok) {
        setDoctors(data.doctors);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error('Error al cargar doctores:', err);
      setDoctors([]);
    }
  };

  const loadAvailability = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/doctor/availability?doctorId=${formData.doctorId}&date=${formData.date}`);
      const data = await res.json();
      
      if (res.ok) {
        setAvailableSlots(data.availableSlots || []);
        if (data.availableSlots.length === 0) {
          setError(data.message || 'No hay horarios disponibles para esta fecha');
        } else {
          setError('');
        }
      } else {
        setAvailableSlots([]);
        setError('Error al cargar disponibilidad');
      }
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
      setAvailableSlots([]);
      setError('Error de conexión');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validaciones
    if (!formData.specialty || !formData.doctorId || !formData.date || !formData.startTime || !formData.reason) {
      setError('Por favor completa todos los campos requeridos');
      setLoading(false);
      return;
    }

    if (formData.reason.length < 10) {
      setError('Por favor describe el motivo de la consulta con más detalle (mínimo 10 caracteres)');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Redirigir a mis citas después de 2 segundos
        setTimeout(() => {
          router.push('/mis-citas');
        }, 2000);
      } else {
        setError(data.error || 'Error al agendar cita');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (status === 'loading') {
    return <LoadingSpinner size="lg" message="Cargando formulario..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Agendar Cita Médica
          </h1>
          <p className="text-gray-600">
            Completa el formulario para reservar tu consulta
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-green-700 font-medium">¡Cita agendada exitosamente!</p>
                <p className="text-green-600 text-sm">Redirigiendo a tus citas...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de consulta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Consulta *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidad *
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value, doctorId: '' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Selecciona una especialidad</option>
                {SPECIALTIES.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor *
              </label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!formData.specialty || doctors.length === 0}
              >
                <option value="">
                  {!formData.specialty 
                    ? 'Primero selecciona una especialidad'
                    : doctors.length === 0
                    ? 'No hay doctores disponibles'
                    : 'Selecciona un doctor'}
                </option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr(a). {doctor.name || doctor.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, startTime: '', endTime: '' })}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!formData.doctorId}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {!formData.doctorId ? 'Primero selecciona un doctor' : 'Selecciona la fecha de tu cita'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                {loadingSlots ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-2 text-gray-600">Cargando horarios...</span>
                  </div>
                ) : (
                  <select
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.doctorId || !formData.date || availableSlots.length === 0}
                  >
                    <option value="">
                      {!formData.doctorId || !formData.date
                        ? 'Primero selecciona doctor y fecha'
                        : availableSlots.length === 0
                        ? 'No hay horarios disponibles'
                        : 'Selecciona un horario'}
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot.startTime} value={slot.startTime}>
                        {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                  </select>
                )}
                {formData.startTime && formData.endTime && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ✓ Horario disponible
                  </p>
                )}
                {availableSlots.length === 0 && formData.date && formData.doctorId && !loadingSlots && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    El doctor no está disponible este día
                  </p>
                )}
              </div>
            </div>

            {/* Motivo de consulta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la Consulta *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Describe brevemente el motivo de tu consulta..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Máximo 500 caracteres
                </p>
                <p className="text-xs text-gray-500">
                  {formData.reason.length}/500
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Agendando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Agendar Cita
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
