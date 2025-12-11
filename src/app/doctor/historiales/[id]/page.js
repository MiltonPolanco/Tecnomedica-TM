'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit2, Calendar, User, Activity, Pill, FileText, Clock, CheckCircle, Printer } from 'lucide-react';

export default function HistorialDetallePage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allRecords, setAllRecords] = useState([]);
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    params.then(p => setRecordId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/');
    } else if (status === 'authenticated' && recordId) {
      fetchRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router, recordId]);

  const fetchRecord = async () => {
    if (!recordId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/medical-records/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setRecord(data);

        const allRes = await fetch(`/api/medical-records?patientId=${data.patient._id}`);
        if (allRes.ok) {
          const allData = await allRes.json();
          setAllRecords(allData);
        }
      } else {
        router.push('/doctor/historiales');
      }
    } catch (error) {
      console.error('Error:', error);
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status !== 'authenticated' || session?.user?.role !== 'doctor' || !record) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/doctor/historiales')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Historiales
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Historial Médico
              </h1>
              <p className="text-gray-600 mt-1">
                Creado {formatDateTime(record.createdAt)}
              </p>
            </div>
            <button
              onClick={() => router.push(`/doctor/historiales/${recordId}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{record.patient.name}</h2>
                  <p className="text-gray-600">{record.patient.email}</p>
                  {record.patient.phone && (
                    <p className="text-gray-600">{record.patient.phone}</p>
                  )}
                </div>
              </div>
              {record.patient.bloodType && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Tipo de Sangre: <span className="text-red-600">{record.patient.bloodType}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Consult Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Información de la Consulta</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Consulta</p>
                  <p className="font-medium">{formatDate(record.consultDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Motivo de Consulta</p>
                  <p className="font-medium">{record.reason}</p>
                </div>
                {record.symptoms && (
                  <div>
                    <p className="text-sm text-gray-600">Síntomas</p>
                    <p className="text-gray-800">{record.symptoms}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vital Signs */}
            {Object.values(record.vitalSigns).some(v => v) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Signos Vitales</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {record.vitalSigns.bloodPressure && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Presión Arterial</p>
                      <p className="font-semibold">{record.vitalSigns.bloodPressure}</p>
                    </div>
                  )}
                  {record.vitalSigns.heartRate && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Frecuencia Cardíaca</p>
                      <p className="font-semibold">{record.vitalSigns.heartRate}</p>
                    </div>
                  )}
                  {record.vitalSigns.temperature && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Temperatura</p>
                      <p className="font-semibold">{record.vitalSigns.temperature}</p>
                    </div>
                  )}
                  {record.vitalSigns.weight && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Peso</p>
                      <p className="font-semibold">{record.vitalSigns.weight}</p>
                    </div>
                  )}
                  {record.vitalSigns.height && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Altura</p>
                      <p className="font-semibold">{record.vitalSigns.height}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Diagnosis & Treatment */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Diagnóstico y Tratamiento</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico</p>
                  <p className="text-gray-800">{record.diagnosis}</p>
                </div>
                {record.treatment && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Tratamiento</p>
                    <p className="text-gray-800">{record.treatment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Medications */}
            {record.medications && record.medications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Medicamentos Recetados</h3>
                </div>
                <div className="space-y-3">
                  {record.medications.map((med, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-semibold text-gray-900">{med.name}</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-700">
                        <p><span className="font-medium">Dosis:</span> {med.dosage}</p>
                        {med.frequency && <p><span className="font-medium">Frecuencia:</span> {med.frequency}</p>}
                        {med.duration && <p><span className="font-medium">Duración:</span> {med.duration}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* Exams */}
            {record.exams && record.exams.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Exámenes Realizados</h3>
                  </div>
                  <span className="text-sm text-gray-500">{record.exams.length} {record.exams.length === 1 ? 'examen' : 'exámenes'}</span>
                </div>
                <div className="space-y-4">
                  {record.exams.map((exam, index) => {
                    const examStatus = exam.status || 'completed';
                    const statusConfig = {
                      completed: { label: 'Completado', color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircle },
                      pending: { label: 'Pendiente', color: 'text-amber-700 bg-amber-100 border-amber-200', icon: Clock },
                      requested: { label: 'Solicitado', color: 'text-blue-700 bg-blue-100 border-blue-200', icon: Activity }
                    };

                    const config = statusConfig[examStatus] || statusConfig.completed;
                    const StatusIcon = config.icon;

                    return (
                      <div key={index} className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-gray-900 text-lg">{exam.name}</h4>
                              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(exam.date)}
                            </p>
                          </div>
                          {exam.result && (
                            <div className="ml-4 bg-white px-4 py-2 rounded-lg text-sm font-semibold text-teal-700 shadow-sm border border-teal-200">
                              {exam.result}
                            </div>
                          )}
                        </div>
                        {exam.notes && (
                          <div className="mt-3 p-3 bg-white/70 rounded-lg border border-teal-100">
                            <p className="text-sm text-gray-700 italic leading-relaxed">
                              "{exam.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            {record.notes && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas Adicionales</h3>
                <p className="text-gray-800 whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}

            {/* Next Follow Up */}
            {record.nextFollowUp && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Próximo Seguimiento</h3>
                </div>
                <p className="text-gray-800">{formatDate(record.nextFollowUp)}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Patient Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Historial del Paciente
              </h3>
              {allRecords.length === 0 ? (
                <p className="text-gray-600 text-sm">No hay otros registros</p>
              ) : (
                <div className="space-y-3">
                  {allRecords.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => router.push(`/doctor/historiales/${r._id}`)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${r._id === recordId
                        ? 'bg-blue-100 border-2 border-blue-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(r.consultDate)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{r.reason}</p>
                      <p className="text-xs text-blue-600 mt-1">{r.diagnosis}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
