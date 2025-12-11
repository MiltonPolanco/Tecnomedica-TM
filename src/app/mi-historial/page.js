'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FileText, Calendar, Activity, Pill, User, Clock } from 'lucide-react';

export default function MiHistorialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'patient') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchRecords();
    }
  }, [status, session, router]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/medical-records');
      const data = await res.json();
      setRecords(data);
      if (data.length > 0) {
        setSelectedRecord(data[0]);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'patient') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Historial Médico
          </h1>
          <p className="text-gray-600">
            Consulta todos tus registros médicos y diagnósticos
          </p>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes historial médico
            </h3>
            <p className="text-gray-600">
              Tus consultas con los doctores aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Historial ({records.length})
                </h3>
                <div className="space-y-3">
                  {records.map((record) => (
                    <button
                      key={record._id}
                      onClick={() => setSelectedRecord(record)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${selectedRecord?._id === record._id
                          ? 'bg-blue-100 border-2 border-blue-600'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(record.consultDate)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        Dr. {record.doctor.name}
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {record.reason}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              {selectedRecord && (
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Atendido por</p>
                        <p className="text-lg font-semibold text-gray-900">
                          Dr. {selectedRecord.doctor.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Consult Info */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Consulta - {formatDate(selectedRecord.consultDate)}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Motivo de Consulta</p>
                        <p className="font-medium text-gray-900">{selectedRecord.reason}</p>
                      </div>
                      {selectedRecord.symptoms && (
                        <div>
                          <p className="text-sm text-gray-600">Síntomas</p>
                          <p className="text-gray-800">{selectedRecord.symptoms}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vital Signs */}
                  {Object.values(selectedRecord.vitalSigns).some(v => v) && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Signos Vitales</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedRecord.vitalSigns.bloodPressure && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Presión Arterial</p>
                            <p className="font-semibold">{selectedRecord.vitalSigns.bloodPressure}</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.heartRate && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Frecuencia Cardíaca</p>
                            <p className="font-semibold">{selectedRecord.vitalSigns.heartRate}</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.temperature && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Temperatura</p>
                            <p className="font-semibold">{selectedRecord.vitalSigns.temperature}</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.weight && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Peso</p>
                            <p className="font-semibold">{selectedRecord.vitalSigns.weight}</p>
                          </div>
                        )}
                        {selectedRecord.vitalSigns.height && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Altura</p>
                            <p className="font-semibold">{selectedRecord.vitalSigns.height}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Diagnosis */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Diagnóstico</h3>
                    </div>
                    <p className="text-gray-800">{selectedRecord.diagnosis}</p>
                  </div>

                  {/* Treatment */}
                  {selectedRecord.treatment && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tratamiento</h3>
                      <p className="text-gray-800">{selectedRecord.treatment}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Pill className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Medicamentos Recetados
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {selectedRecord.medications.map((med, index) => (
                          <div key={index} className="p-4 bg-blue-50 rounded-lg">
                            <p className="font-semibold text-gray-900">{med.name}</p>
                            <div className="mt-2 space-y-1 text-sm text-gray-700">
                              <p><span className="font-medium">Dosis:</span> {med.dosage}</p>
                              {med.frequency && (
                                <p><span className="font-medium">Frecuencia:</span> {med.frequency}</p>
                              )}
                              {med.duration && (
                                <p><span className="font-medium">Duración:</span> {med.duration}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exams */}
                  {selectedRecord.exams && selectedRecord.exams.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-teal-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Exámenes Realizados</h3>
                      </div>
                      <div className="space-y-3">
                        {selectedRecord.exams.map((exam, index) => (
                          <div key={index} className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">{exam.name}</p>
                                <p className="text-sm text-gray-500">{formatDate(exam.date)}</p>
                              </div>
                              {exam.result && (
                                <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-teal-700 shadow-sm">
                                  {exam.result}
                                </div>
                              )}
                            </div>
                            {exam.notes && (
                              <p className="mt-2 text-sm text-gray-600 italic">
                                "{exam.notes}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedRecord.notes && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Notas Adicionales
                      </h3>
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedRecord.notes}</p>
                    </div>
                  )}

                  {/* Next Follow Up */}
                  {selectedRecord.nextFollowUp && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Próximo Seguimiento
                        </h3>
                      </div>
                      <p className="text-gray-800">{formatDate(selectedRecord.nextFollowUp)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
