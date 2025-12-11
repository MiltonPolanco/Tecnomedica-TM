'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Users, Search, FileText, Calendar, Plus, User as UserIcon } from 'lucide-react';

export default function HistorialesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      // Get all medical records to extract unique patients
      const res = await fetch('/api/medical-records');
      const records = await res.json();

      // Group records by patient and count
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
        // Update last consult if this is more recent
        if (new Date(record.consultDate) > new Date(patient.lastConsult)) {
          patient.lastConsult = record.consultDate;
        }
      });

      setPatients(Array.from(patientsMap.values()));
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
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
            Mis Pacientes
          </h1>
          <p className="text-gray-600">
            Accede a los historiales médicos de tus pacientes
          </p>
        </div>

        {/* Search & Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar paciente por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* New Record Button */}
            <button
              onClick={() => router.push('/doctor/historiales/nuevo')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Historial
            </button>
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes aún'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Intenta con otro término de búsqueda'
                : 'Comienza creando tu primer historial médico'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/doctor/historiales/nuevo')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Historial
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient._id}
                onClick={() => router.push(`/doctor/historiales/paciente/${patient._id}`)}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-200"
              >
                {/* Patient Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {patient.email}
                    </p>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Historiales
                    </span>
                    <span className="font-semibold text-blue-600">
                      {patient.recordCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Última consulta:</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 ml-6">
                    {formatDate(patient.lastConsult)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
