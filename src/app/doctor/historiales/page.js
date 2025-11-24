'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Plus, Calendar, User, Clock } from 'lucide-react';

export default function HistorialesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/');
    }
  }, [status, session, router]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedPatient
        ? `/api/medical-records?patientId=${selectedPatient}`
        : '/api/medical-records';
      const res = await fetch(url);
      const data = await res.json();
      setRecords(data);

      const uniquePatients = Array.from(
        new Map(data.map((r) => [r.patient._id, r.patient])).values()
      );
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error al cargar historiales:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'doctor') {
      fetchRecords();
    }
  }, [status, session, selectedPatient, fetchRecords]);

  const filteredRecords = records.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.patient.name.toLowerCase().includes(searchLower) ||
      record.diagnosis.toLowerCase().includes(searchLower) ||
      record.reason.toLowerCase().includes(searchLower)
    );
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Historiales Médicos
          </h1>
          <p className="text-gray-600">
            Gestiona y consulta los historiales de tus pacientes
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, diagnóstico o motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Patient Filter */}
            <div>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los pacientes</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => router.push('/doctor/historiales/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Historial
            </button>
          </div>
        </div>

        {/* Records List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay historiales
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedPatient
                ? 'No se encontraron historiales con los filtros aplicados'
                : 'Aún no has creado ningún historial médico'}
            </p>
            <button
              onClick={() => router.push('/doctor/historiales/nuevo')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Historial
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRecords.map((record) => (
              <div
                key={record._id}
                onClick={() => router.push(`/doctor/historiales/${record._id}`)}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.patient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {record.patient.email}
                        </p>
                      </div>
                    </div>

                    <div className="ml-13 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(record.consultDate)}</span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Motivo:
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {record.reason}
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Diagnóstico:
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {record.diagnosis}
                        </span>
                      </div>

                      {record.nextFollowUp && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            Próximo seguimiento:{' '}
                            {formatDate(record.nextFollowUp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
