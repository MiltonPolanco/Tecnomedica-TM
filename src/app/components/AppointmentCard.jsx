import { memo } from 'react';

const AppointmentCard = memo(function AppointmentCard({ 
  appointment, 
  formatDate, 
  onCancel, 
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS 
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
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
              onClick={() => onCancel(appointment)}
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
  );
});

AppointmentCard.displayName = 'AppointmentCard';

export default AppointmentCard;
