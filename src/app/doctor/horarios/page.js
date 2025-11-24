'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Clock, Calendar, Save, Trash2, Plus, Settings } from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export default function DoctorSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [blockedDate, setBlockedDate] = useState('');
  const [blockedReason, setBlockedReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/');
    }
  }, [status, session, router]);

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch('/api/doctor/schedule');
      if (res.ok) {
        const data = await res.json();
        setSchedule(data.schedule);
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'doctor') {
      loadSchedule();
    }
  }, [status, session, loadSchedule]);

  const handleDayToggle = (dayOfWeek) => {
    setSchedule(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { ...day, isAvailable: !day.isAvailable }
          : day
      )
    }));
  };

  const handleAddTimeSlot = (dayOfWeek) => {
    setSchedule(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { 
              ...day, 
              timeSlots: [...day.timeSlots, { startTime: '09:00', endTime: '10:00' }]
            }
          : day
      )
    }));
  };

  const handleRemoveTimeSlot = (dayOfWeek, slotIndex) => {
    setSchedule(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { 
              ...day, 
              timeSlots: day.timeSlots.filter((_, idx) => idx !== slotIndex)
            }
          : day
      )
    }));
  };

  const handleTimeSlotChange = (dayOfWeek, slotIndex, field, value) => {
    setSchedule(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map(day => 
        day.dayOfWeek === dayOfWeek 
          ? { 
              ...day, 
              timeSlots: day.timeSlots.map((slot, idx) => 
                idx === slotIndex ? { ...slot, [field]: value } : slot
              )
            }
          : day
      )
    }));
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/doctor/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklySchedule: schedule.weeklySchedule,
          consultationDuration: schedule.consultationDuration,
          allowBookingDaysInAdvance: schedule.allowBookingDaysInAdvance,
          minAdvanceBookingHours: schedule.minAdvanceBookingHours,
        }),
      });

      if (res.ok) {
        alert('✅ Horarios guardados exitosamente.\n\nLos pacientes ahora verán tu disponibilidad actualizada al momento de agendar citas.');
        loadSchedule();
      } else {
        alert('❌ Error al guardar horarios. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar horarios. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async () => {
    if (!blockedDate) return;

    try {
      const res = await fetch('/api/doctor/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: blockedDate,
          reason: blockedReason || 'No disponible',
        }),
      });

      if (res.ok) {
        alert('✅ Fecha bloqueada exitosamente.\n\nLos pacientes no podrán agendar citas en esta fecha.');
        setBlockedDate('');
        setBlockedReason('');
        loadSchedule();
      } else {
        alert('❌ Error al bloquear fecha');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al bloquear fecha');
    }
  };

  const handleRemoveBlockedDate = async (dateId) => {
    const confirmRemove = confirm('¿Desbloquear esta fecha?\n\nLos pacientes podrán volver a agendar citas en este día.');
    if (!confirmRemove) return;

    try {
      const res = await fetch(`/api/doctor/schedule?blockedDateId=${dateId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Fecha desbloqueada exitosamente');
        loadSchedule();
      } else {
        alert('❌ Error al desbloquear fecha');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al desbloquear fecha');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!schedule) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600" />
            Configuración de Horarios
          </h1>
          <p className="text-gray-600 mt-2">Gestiona tu disponibilidad y horarios de atención</p>
        </div>

        {/* Guía de Ayuda */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ¿Cómo funciona esta configuración?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 ml-7">
            <li>• <strong>Duración de Consulta:</strong> Define cuántos minutos dura cada cita (ej: 30 min = slots cada 30 minutos)</li>
            <li>• <strong>Reserva con anticipación:</strong> Máximo de días futuros que los pacientes pueden agendar</li>
            <li>• <strong>Tiempo mínimo de aviso:</strong> Horas mínimas antes de la cita para poder agendarla</li>
            <li>• <strong>Horarios Semanales:</strong> Activa los días que trabajas y define tus horarios (puedes tener varios bloques por día)</li>
            <li>• <strong>Fechas Bloqueadas:</strong> Bloquea días específicos para vacaciones, conferencias, etc.</li>
          </ul>
        </div>

        {/* Configuración General */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Configuración General
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de Consulta (minutos)
              </label>
              <input
                type="number"
                min="15"
                max="120"
                step="15"
                value={schedule.consultationDuration}
                onChange={(e) => setSchedule(prev => ({ ...prev, consultationDuration: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ej: 30 min = slots de 9:00-9:30, 9:30-10:00, etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reserva con anticipación (días)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={schedule.allowBookingDaysInAdvance}
                onChange={(e) => setSchedule(prev => ({ ...prev, allowBookingDaysInAdvance: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Pacientes pueden agendar hasta {schedule.allowBookingDaysInAdvance} días adelante
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo mínimo de aviso (horas)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={schedule.minAdvanceBookingHours}
                onChange={(e) => setSchedule(prev => ({ ...prev, minAdvanceBookingHours: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Citas deben agendarse con {schedule.minAdvanceBookingHours}h de anticipación
              </p>
            </div>
          </div>
        </div>

        {/* Horarios Semanales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Horarios Semanales
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Activa los días que trabajas y agrega los bloques de horario. Ejemplo: Lunes 9:00-12:00 y 14:00-18:00 (dos bloques).
          </p>

          <div className="space-y-4">
            {DAYS_OF_WEEK.map(({ value, label }) => {
              const daySchedule = schedule.weeklySchedule.find(d => d.dayOfWeek === value) || {
                dayOfWeek: value,
                isAvailable: false,
                timeSlots: []
              };

              return (
                <div key={value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={daySchedule.isAvailable}
                        onChange={() => handleDayToggle(value)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-900">{label}</span>
                    </div>
                    
                    {daySchedule.isAvailable && (
                      <button
                        onClick={() => handleAddTimeSlot(value)}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Horario
                      </button>
                    )}
                  </div>

                  {daySchedule.isAvailable && (
                    <div className="space-y-2 ml-8">
                      {daySchedule.timeSlots.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => handleTimeSlotChange(value, idx, 'startTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-500">a</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => handleTimeSlotChange(value, idx, 'endTime', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleRemoveTimeSlot(value, idx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Fechas Bloqueadas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Fechas Bloqueadas</h2>
          <p className="text-sm text-gray-600 mb-4">
            Bloquea días específicos donde no estarás disponible (vacaciones, días feriados, conferencias, etc.). 
            Los pacientes no podrán agendar citas en estas fechas.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={blockedDate}
                onChange={(e) => setBlockedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón (opcional)
              </label>
              <input
                type="text"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="Ej: Vacaciones, Conferencia"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleBlockDate}
            disabled={!blockedDate}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Bloquear Fecha
          </button>

          {schedule.blockedDates && schedule.blockedDates.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-gray-900">Fechas Bloqueadas:</h3>
              {schedule.blockedDates.map((blocked) => {
                const date = new Date(blocked.date);
                const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                
                return (
                  <div key={blocked._id} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {localDate.toLocaleDateString('es-SV', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          timeZone: 'America/El_Salvador'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{blocked.reason}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveBlockedDate(blocked._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
