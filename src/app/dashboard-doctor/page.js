'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  BarChart3,
  CalendarDays
} from 'lucide-react';

export default function DashboardDoctorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'doctor') {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments/stats');
      const data = await res.json();

      if (res.ok) {
        setStats(data.stats);
        setUpcomingAppointments(data.upcomingAppointments);
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'doctor') {
    return null;
  }

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    'in-progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    'no-show': 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const statusLabels = {
    scheduled: 'Programada',
    confirmed: 'Confirmada',
    'in-progress': 'En Progreso',
    completed: 'Completada',
    cancelled: 'Cancelada',
    'no-show': 'No Asistió',
  };

  const typeLabels = {
    consultation: 'Consulta',
    'follow-up': 'Seguimiento',
    emergency: 'Emergencia',
    vaccination: 'Vacunación',
    exam: 'Examen',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-blue-600" />
            Dashboard del Doctor
          </h1>
          <p className="text-gray-600 text-lg">
            Bienvenido, <span className="font-semibold text-blue-600">{session.user.name}</span>
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Citas de hoy */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-8 h-8" />
              </div>
              <TrendingUp className="w-6 h-6 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.todayAppointments || 0}</h3>
            <p className="text-blue-100 font-medium">Citas de Hoy</p>
          </div>

          {/* Citas de la semana */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CalendarDays className="w-8 h-8" />
              </div>
              <BarChart3 className="w-6 h-6 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.weekAppointments || 0}</h3>
            <p className="text-purple-100 font-medium">Esta Semana</p>
          </div>

          {/* Citas del mes */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-8 h-8" />
              </div>
              <CheckCircle className="w-6 h-6 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.monthAppointments || 0}</h3>
            <p className="text-green-100 font-medium">Este Mes</p>
          </div>

          {/* Total pacientes */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
              <Activity className="w-6 h-6 opacity-80" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats?.totalPatients || 0}</h3>
            <p className="text-orange-100 font-medium">Pacientes</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Próximas Citas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Próximas Citas
                </h2>
                <Link
                  href="/mi-calendario"
                  className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-sm border border-white/30"
                >
                  Ver Calendario
                </Link>
              </div>

              <div className="p-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tienes citas próximas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all bg-gradient-to-r from-white to-blue-50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {appointment.patient?.name?.[0]?.toUpperCase() || 'P'}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {appointment.patient?.name || 'Paciente'}
                                </h3>
                                <p className="text-sm text-gray-500">{appointment.patient?.email}</p>
                              </div>
                            </div>
                            
                            <div className="ml-13 space-y-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Motivo:</span> {appointment.reason}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Calendar className="w-4 h-4" />
                                  {(() => {
                                    const date = new Date(appointment.date);
                                    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                                    return localDate.toLocaleDateString('es-ES', {
                                      weekday: 'short',
                                      day: 'numeric',
                                      month: 'short',
                                    });
                                  })()}
                                </span>
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  {appointment.startTime} - {appointment.endTime}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appointment.status]}`}>
                              {statusLabels[appointment.status]}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {typeLabels[appointment.type]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="space-y-6">
            {/* Estado de citas del mes */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Estado de Citas
                </h2>
              </div>

              <div className="p-6 space-y-3">
                {stats?.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 ? (
                  <>
                    {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {status === 'cancelled' && <XCircle className="w-5 h-5 text-red-600" />}
                          {status === 'scheduled' && <Clock className="w-5 h-5 text-blue-600" />}
                          {status === 'confirmed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {status === 'no-show' && <AlertCircle className="w-5 h-5 text-orange-600" />}
                          <span className="text-sm font-medium text-gray-700">
                            {statusLabels[status]}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
                )}
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white">Accesos Rápidos</h2>
              </div>

              <div className="p-6 space-y-3">
                <Link
                  href="/mi-calendario"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all border-2 border-blue-200 hover:border-blue-400 group"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Mi Calendario</span>
                </Link>

                <Link
                  href="/mis-citas"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:shadow-lg transition-all border-2 border-purple-200 hover:border-purple-400 group"
                >
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Mis Citas</span>
                </Link>

                <Link
                  href="/perfil"
                  className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all border-2 border-green-200 hover:border-green-400 group"
                >
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">Mi Perfil</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
