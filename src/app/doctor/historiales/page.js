'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, Search, FileText, Calendar, Plus, User as UserIcon, ChevronDown, ChevronUp, Edit2, Activity, Pill, Clock, X } from 'lucide-react';
export default function HistorialesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/');
    }
  }, [status, session, router]);
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'doctor') {
      fetchPatients();
    }
  }, [status, session]);
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/medical-records');
      const records = await res.json();
      const patientsMap = new Map();
      records.forEach(record => {
        const patientId = record.patient._id;
        if (!patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            ...record.patient,
            recordCount: 0,
            lastConsult: record.consultDate
          });
        }
        const patient = patientsMap.get(patientId);
        patient.recordCount++;
        if (new Date(record.consultDate) > new Date(patient.lastConsult)) {
          patient.lastConsult = record.consultDate;
        }
      });
      setRecords(records);
      setPatients(Array.from(patientsMap.values()));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower)
    );
  });
  const filteredRecords = selectedPatient
    ? records.filter(r => r.patient._id === selectedPatient._id)
    : records;
  const toggleExpand = (recordId) => {
    setExpandedRecordId(expandedRecordId === recordId ? null : recordId);
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
  if (status !== 'authenticated' || session?.user?.role !== 'doctor') {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Pacientes
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <button
              onClick={() => setSelectedPatient(null)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${!selectedPatient ? 'border-blue-600 bg-blue-50' : 'border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                  *
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Todos los pacientes</p>
                  <p className="text-xs text-gray-500">{records.length} historiales</p>
                </div>
              </div>
            </button>
            {filteredPatients.map((patient) => (
              <button
                key={patient._id}
                onClick={() => setSelectedPatient(patient)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${selectedPatient?._id === patient._id ? 'border-blue-600 bg-blue-50' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 truncate">{patient.name}</p>
                    <p className="text-xs text-gray-500 truncate">{patient.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">📋 {patient.recordCount}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">{formatDate(patient.lastConsult)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedPatient ? selectedPatient.name : 'Todos los Historiales'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {filteredRecords.length} {filteredRecords.length === 1 ? 'historial' : 'historiales'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/doctor/historiales/nuevo')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Nuevo Historial
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay historiales
                </h3>
                <p className="text-gray-600 mb-6">
                  {selectedPatient
                    ? `No hay historiales para ${selectedPatient.name}`
                    : 'Comienza creando tu primer historial médico'}
                </p>
                <button
                  onClick={() => router.push('/doctor/historiales/nuevo')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Crear Historial
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => {
                  const isExpanded = expandedRecordId === record._id;
                  return (
                    <div
                      key={record._id}
                      className={`bg-white rounded-xl shadow-sm border-2 transition-all ${isExpanded ? 'border-blue-200' : 'border-gray-100'}`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">
                                {formatDate(record.consultDate)}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {record.reason}
                            </h3>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Diagnóstico:</span> {record.diagnosis}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              {record.medications && record.medications.length > 0 && (
                                <span className="text-sm text-purple-600 flex items-center gap-1">
                                  <Pill className="w-4 h-4" />
                                  {record.medications.length} medicamento{record.medications.length !== 1 && 's'}
                                </span>
                              )}
                              {record.exams && record.exams.length > 0 && (
                                <span className="text-sm text-teal-600 flex items-center gap-1">
                                  <Activity className="w-4 h-4" />
                                  {record.exams.length} examen{record.exams.length !== 1 && 'es'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/doctor/historiales/${record._id}/editar`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => toggleExpand(record._id)}
                              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center gap-2"
                            >
                              {isExpanded ? (
                                <>
                                  Cerrar <ChevronUp className="w-4 h-4" />
                                </>
                              ) : (
                                <>
                                  Ver más <ChevronDown className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                          {record.symptoms && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Síntomas</h4>
                              <p className="text-gray-700">{record.symptoms}</p>
                            </div>
                          )}
                          {Object.values(record.vitalSigns).some(v => v) && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Signos Vitales
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {record.vitalSigns.bloodPressure && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Presión Arterial</p>
                                    <p className="font-semibold">{record.vitalSigns.bloodPressure}</p>
                                  </div>
                                )}
                                {record.vitalSigns.heartRate && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Frec. Cardíaca</p>
                                    <p className="font-semibold">{record.vitalSigns.heartRate}</p>
                                  </div>
                                )}
                                {record.vitalSigns.temperature && (
                                  <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-600">Temperatura</p>
                                    <p className="font-semibold">{record.vitalSigns.temperature}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {record.treatment && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Tratamiento</h4>
                              <p className="text-gray-700">{record.treatment}</p>
                            </div>
                          )}
                          {record.medications && record.medications.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Pill className="w-5 h-5 text-purple-600" />
                                Medicamentos ({record.medications.length})
                              </h4>
                              <div className="grid gap-3">
                                {record.medications.map((med, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900">{med.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      Dosis: {med.dosage} • Frecuencia: {med.frequency} • Duración: {med.duration}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {record.exams && record.exams.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-teal-600" />
                                Exámenes ({record.exams.length})
                              </h4>
                              <div className="grid gap-3">
                                {record.exams.map((exam, idx) => {
                                  const statusConfig = {
                                    completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
                                    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
                                    requested: { label: 'Solicitado', color: 'bg-blue-100 text-blue-700' }
                                  };
                                  const config = statusConfig[exam.status || 'completed'];
                                  return (
                                    <div key={idx} className="bg-white p-4 rounded-lg">
                                      <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold text-gray-900">{exam.name}</p>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${config.color}`}>
                                          {config.label}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">{formatDate(exam.date)}</p>
                                      {exam.result && (
                                        <p className="text-sm text-gray-700 mt-1">Resultado: {exam.result}</p>
                                      )}
                                      {exam.notes && (
                                        <p className="text-sm text-gray-600 mt-1 italic">"{exam.notes}"</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {record.notes && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Notas Adicionales</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                            </div>
                          )}
                          {record.nextFollowUp && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-amber-800">
                                <Clock className="w-5 h-5" />
                                <span className="font-semibold">Próximo Seguimiento:</span>
                                <span>{formatDate(record.nextFollowUp)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
