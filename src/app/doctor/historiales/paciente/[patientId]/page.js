'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Calendar, User, Clock, Plus, Edit2 } from 'lucide-react';

export default function PatientRecordsPage({ params }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState(null);

    useEffect(() => {
        params.then(p => setPatientId(p.patientId));
    }, [params]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'doctor') {
            router.push('/');
        } else if (status === 'authenticated' && patientId) {
            fetchPatientRecords();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, session, router, patientId]);

    const fetchPatientRecords = async () => {
        if (!patientId) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/medical-records?patientId=${patientId}`);
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
                if (data.length > 0) {
                    setPatient(data[0].patient);
                }
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

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (status !== 'authenticated' || session?.user?.role !== 'doctor' || !patient) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/doctor/historiales')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a Pacientes
                </button>

                {/* Patient Header Card */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl font-bold backdrop-blur-sm">
                            {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{patient.name}</h1>
                            <div className="flex flex-wrap gap-4 text-blue-100">
                                <span className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {patient.email}
                                </span>
                                {patient.phone && (
                                    <span>📞 {patient.phone}</span>
                                )}
                                {patient.bloodType && (
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-sm">
                                        🩸 {patient.bloodType}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/doctor/historiales/nuevo')}
                            className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center gap-2 shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Nuevo Historial
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Historiales</p>
                                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Primera Consulta</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {records.length > 0 ? formatDate(records[records.length - 1].consultDate) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Última Consulta</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {records.length > 0 ? formatDate(records[0].consultDate) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Medical Records Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        Historial Médico
                    </h2>

                    {records.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No hay historiales aún
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Comienza creando el primer historial médico para este paciente
                            </p>
                            <button
                                onClick={() => router.push('/doctor/historiales/nuevo')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                <Plus className="w-5 h-5" />
                                Crear Primer Historial
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {records.map((record, index) => (
                                <div
                                    key={record._id}
                                    className="group relative p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => router.push(`/doctor/historiales/${record._id}`)}
                                >
                                    {/* Timeline indicator */}
                                    {index < records.length - 1 && (
                                        <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gray-200"></div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        {/* Date badge */}
                                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm z-10">
                                            {new Date(record.consultDate).getDate()}
                                            <br />
                                            {new Date(record.consultDate).toLocaleDateString('es-SV', { month: 'short' })}
                                        </div>

                                        {/* Record info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                        {record.reason}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(record.consultDate)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/doctor/historiales/${record._id}/editar`);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-sm font-medium text-gray-700">Diagnóstico: </span>
                                                    <span className="text-sm text-gray-600">{record.diagnosis}</span>
                                                </div>
                                                {record.treatment && (
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Tratamiento: </span>
                                                        <span className="text-sm text-gray-600">{record.treatment}</span>
                                                    </div>
                                                )}
                                                {record.medications && record.medications.length > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-purple-600">
                                                        💊 {record.medications.length} {record.medications.length === 1 ? 'medicamento' : 'medicamentos'}
                                                    </div>
                                                )}
                                                {record.exams && record.exams.length > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-teal-600">
                                                        🔬 {record.exams.length} {record.exams.length === 1 ? 'examen' : 'exámenes'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
