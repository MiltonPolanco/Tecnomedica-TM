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
    }
  }, [formData.specialty]);

  // Auto-calcular endTime cuando se selecciona startTime
  useEffect(() => {
    if (formData.startTime) {
      const [hour, minute] = formData.startTime.split(':').map(Number);
      const endHour = hour + (minute === 30 ? 1 : 0);
      const endMinute = minute === 30 ? '00' : '30';
      setFormData(prev => ({
        ...prev,
        endTime: `${String(endHour).padStart(2, '0')}:${endMinute}`
      }));
    }
  }, [formData.startTime]);

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

  // Obtener fecha mínima (hoy)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Obtener fecha máxima (3 meses adelante)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return maxDate.toISOString().split('T')[0];
  };

  if (status === 'loading') {
    return <LoadingSpinner size="lg" message="Cargando formulario..." />;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-primary mb-6">Agendar Cita Médica</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ ¡Cita agendada exitosamente! Redirigiendo a tus citas...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Selecciona una hora</option>
                {AVAILABLE_TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
              {formData.startTime && (
                <p className="text-sm text-gray-500 mt-1">
                  Duración: 30 minutos (hasta {formData.endTime})
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.reason.length}/500 caracteres
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Agendando...' : 'Agendar Cita'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
