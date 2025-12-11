'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Search, FileText, Calendar, Plus, User as UserIcon, ChevronDown, ChevronUp, Edit2, Activity, Pill, Clock, X } from 'lucide-react';
export default function HistorialesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/medical-records');

      if (!res.ok) {
        throw new Error('Error al cargar los historiales');
      }

      const records = await res.json();

      // Validar que records sea un array
      if (!Array.isArray(records)) {
        throw new Error('Respuesta inválida del servidor');
      }

      const patientsMap = new Map();
      records.forEach(record => {
        // Validar que el registro tenga paciente
        if (!record.patient?._id) {
          console.warn('Registro sin paciente válido:', record);
          return;
        }

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
      setError(error.message || 'Error al cargar los historiales');
    } finally {
      setLoading(false);
    }
  }, []);
  // Memoizar filtrado de pacientes para evitar recálculos innecesarios
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;

    const searchLower = searchTerm.toLowerCase();
    return patients.filter((patient) => (
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower)
    ));
  }, [patients, searchTerm]);

  // Memoizar filtrado de registros
  const filteredRecords = useMemo(() => {
    return selectedPatient
      ? records.filter(r => r.patient?._id === selectedPatient._id)
      : records;
  }, [records, selectedPatient]);

  // Optimizar función de toggle con useCallback
  const toggleExpand = useCallback((recordId) => {
    setExpandedRecordId(prev => prev === recordId ? null : recordId);
  }, []);

  // Memoizar función de formateo de fecha
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-SV', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchPatients}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Reintentar
            </button>
          </div>
        </div>
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
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm`}>
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Mis Pacientes
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            {/* Barra de búsqueda mejorada */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-blue-200 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
                <p className="text-xs text-blue-600/70 font-medium">Pacientes</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                <p className="text-2xl font-bold text-purple-600">{records.length}</p>
                <p className="text-xs text-purple-600/70 font-medium">Historiales</p>
              </div>
            </div>
          </div>

          {/* Lista de pacientes */}
          <div className="flex-1 overflow-y-auto">
            {/* Botón Ver Todos */}
            <button
              onClick={() => setSelectedPatient(null)}
              className={`w-full p-4 text-left transition-all border-l-4 ${!selectedPatient
                  ? 'border-blue-600 bg-blue-50/80'
                  : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${!selectedPatient
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${!selectedPatient ? 'text-blue-900' : 'text-gray-900'}`}>
                    Todos los pacientes
                  </p>
                  <p className="text-xs text-gray-500">Ver todos los historiales</p>
                </div>
                {!selectedPatient && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>

            {/* Separador */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Lista de Pacientes ({filteredPatients.length})
              </p>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">No se encontraron pacientes</p>
                <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
              </div>
            ) : (
              <div className="px-2 pb-4 space-y-1">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full p-3 text-left rounded-xl transition-all ${selectedPatient?._id === patient._id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25'
                        : 'hover:bg-white hover:shadow-md bg-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${selectedPatient?._id === patient._id
                          ? 'bg-white/20 text-white'
                          : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        }`}>
                        {patient.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${selectedPatient?._id === patient._id ? 'text-white' : 'text-gray-900'
                          }`}>
                          {patient.name}
                        </p>
                        <p className={`text-xs truncate ${selectedPatient?._id === patient._id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                          {patient.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedPatient?._id === patient._id
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-700'
                            }`}>
                            📋 {patient.recordCount} {patient.recordCount === 1 ? 'historial' : 'historiales'}
                          </span>
                        </div>
                      </div>
                      {selectedPatient?._id === patient._id && (
                        <ChevronDown className="w-4 h-4 text-white/70" />
                      )}
                    </div>
                    {selectedPatient?._id !== patient._id && (
                      <div className="mt-2 pl-14">
                        <p className="text-xs text-gray-400">
                          Última consulta: {formatDate(patient.lastConsult)}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
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
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedPatient ? 'Sin historiales para este paciente' : 'No hay historiales médicos'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {selectedPatient
                    ? `Aún no hay historiales médicos registrados para ${selectedPatient.name}. Crea el primer historial para comenzar.`
                    : 'Comienza creando el primer historial médico para tus pacientes.'}
                </p>
                <button
                  onClick={() => router.push('/doctor/historiales/nuevo')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
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
                            <div className="flex items-center gap-3 mb-3">
                              <Calendar className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600">
                                {formatDate(record.consultDate)}
                              </span>
                              {/* Badge de seguimiento pendiente */}
                              {record.nextFollowUp && new Date(record.nextFollowUp) > new Date() && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Seguimiento pendiente
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {record.reason}
                            </h3>

                            {/* Información del paciente si está en vista general */}
                            {!selectedPatient && record.patient && (
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {record.patient.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{record.patient.name}</span>
                              </div>
                            )}

                            <p className="text-sm text-gray-700 mb-3">
                              <span className="font-medium">Diagnóstico:</span> {record.diagnosis}
                            </p>

                            {/* Resumen de signos vitales si existen */}
                            {Object.values(record.vitalSigns || {}).some(v => v) && (
                              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                <Activity className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">Signos vitales registrados</span>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-3">
                              {record.medications && record.medications.length > 0 && (
                                <span className="text-sm text-purple-600 flex items-center gap-1 font-medium">
                                  <Pill className="w-4 h-4" />
                                  {record.medications.length} medicamento{record.medications.length !== 1 && 's'}
                                </span>
                              )}
                              {record.exams && record.exams.length > 0 && (
                                <span className="text-sm text-teal-600 flex items-center gap-1 font-medium">
                                  <Activity className="w-4 h-4" />
                                  {record.exams.length} examen{record.exams.length !== 1 && 'es'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => router.push(`/doctor/historiales/${record._id}/editar`)}
                              className="p-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                              title="Editar historial"
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
                        <div className="border-t border-gray-200 p-6 bg-gradient-to-b from-gray-50 to-white space-y-6">
                          {record.symptoms && (
                            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                Síntomas
                              </h4>
                              <p className="text-gray-700 leading-relaxed">{record.symptoms}</p>
                            </div>
                          )}
                          {Object.values(record.vitalSigns || {}).some(v => v) && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Signos Vitales
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                {record.vitalSigns.bloodPressure && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Presión Arterial</p>
                                    <p className="font-bold text-gray-900 text-lg">{record.vitalSigns.bloodPressure}</p>
                                  </div>
                                )}
                                {record.vitalSigns.heartRate && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Frec. Cardíaca</p>
                                    <p className="font-bold text-gray-900 text-lg">{record.vitalSigns.heartRate}</p>
                                  </div>
                                )}
                                {record.vitalSigns.temperature && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Temperatura</p>
                                    <p className="font-bold text-gray-900 text-lg">{record.vitalSigns.temperature}</p>
                                  </div>
                                )}
                                {record.vitalSigns.weight && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Peso</p>
                                    <p className="font-bold text-gray-900 text-lg">{record.vitalSigns.weight}</p>
                                  </div>
                                )}
                                {record.vitalSigns.height && (
                                  <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="text-xs text-gray-500 mb-1">Altura</p>
                                    <p className="font-bold text-gray-900 text-lg">{record.vitalSigns.height}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {record.treatment && (
                            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                Tratamiento
                              </h4>
                              <p className="text-gray-700 leading-relaxed">{record.treatment}</p>
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
                                  <div key={idx} className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                                    <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                      <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                                      {med.name}
                                    </p>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                      <div>
                                        <p className="text-xs text-gray-500">Dosis</p>
                                        <p className="text-gray-700 font-medium">{med.dosage}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Frecuencia</p>
                                        <p className="text-gray-700 font-medium">{med.frequency}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Duración</p>
                                        <p className="text-gray-700 font-medium">{med.duration}</p>
                                      </div>
                                    </div>
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
                                    completed: { label: 'Completado', color: 'bg-green-100 text-green-700 border-green-200' },
                                    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 border-amber-200' },
                                    requested: { label: 'Solicitado', color: 'bg-blue-100 text-blue-700 border-blue-200' }
                                  };
                                  const config = statusConfig[exam.status || 'completed'];
                                  return (
                                    <div key={idx} className="bg-white p-4 rounded-lg border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                                          <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
                                          {exam.name}
                                        </p>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                                          {config.label}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">📅 {formatDate(exam.date)}</p>
                                      {exam.result && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded border-l-2 border-teal-600">
                                          <p className="text-xs text-gray-500 mb-1">Resultado</p>
                                          <p className="text-sm text-gray-700 font-medium">{exam.result}</p>
                                        </div>
                                      )}
                                      {exam.notes && (
                                        <p className="text-sm text-gray-600 mt-2 italic">"{exam.notes}"</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {record.notes && (
                            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                                Notas Adicionales
                              </h4>
                              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{record.notes}</p>
                            </div>
                          )}
                          {record.nextFollowUp && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-center gap-3 text-amber-900">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <span className="font-semibold block">Próximo Seguimiento</span>
                                  <span className="text-sm">{formatDate(record.nextFollowUp)}</span>
                                </div>
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
