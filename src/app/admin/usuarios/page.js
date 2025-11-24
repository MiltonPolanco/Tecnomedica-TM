'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Users, 
  Shield, 
  Search, 
  Filter,
  Edit,
  CheckCircle,
  XCircle,
  UserCog,
  Stethoscope,
  User as UserIcon
} from 'lucide-react';

export default function AdminUsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al cargar usuarios' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      newRole: user.role,
      specialty: user.professionalInfo?.specialty || '',
      isActive: user.isActive !== false,
    });
    setShowEditModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser._id,
          role: editingUser.newRole,
          specialty: editingUser.specialty,
          isActive: editingUser.isActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Usuario actualizado exitosamente' });
        setShowEditModal(false);
        fetchUsers();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al actualizar usuario' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const roleColors = {
    patient: 'bg-blue-100 text-blue-700 border-blue-200',
    doctor: 'bg-green-100 text-green-700 border-green-200',
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  const roleLabels = {
    patient: 'Paciente',
    doctor: 'Doctor',
    admin: 'Administrador',
  };

  const roleIcons = {
    patient: UserIcon,
    doctor: Stethoscope,
    admin: Shield,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <UserCog className="w-10 h-10 text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 text-lg">
            Administra roles y permisos de usuarios
          </p>
        </div>

        {/* Mensajes */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`font-medium ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtro por rol */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="all">Todos los roles</option>
                <option value="patient">Pacientes</option>
                <option value="doctor">Doctores</option>
                <option value="admin">Administradores</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.role === 'patient').length}
              </div>
              <div className="text-sm text-gray-600">Pacientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'doctor').length}
              </div>
              <div className="text-sm text-gray-600">Doctores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Administradores</div>
            </div>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Fecha Registro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const RoleIcon = roleIcons[user.role];
                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                              {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.name || 'Sin nombre'}</div>
                              {user.phone && (
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${roleColors[user.role]}`}>
                            <RoleIcon className="w-4 h-4" />
                            {roleLabels[user.role]}
                          </span>
                          {user.role === 'doctor' && user.professionalInfo?.specialty && (
                            <div className="text-xs text-gray-500 mt-1">
                              {user.professionalInfo.specialty}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.isActive !== false ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              <CheckCircle className="w-4 h-4" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                              <XCircle className="w-4 h-4" />
                              Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCog className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Editar Usuario</h3>
              <p className="text-gray-600">{editingUser.email}</p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol del Usuario
                </label>
                <select
                  value={editingUser.newRole}
                  onChange={(e) => setEditingUser({ ...editingUser, newRole: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="patient">Paciente</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {editingUser.newRole === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad
                  </label>
                  <select
                    value={editingUser.specialty}
                    onChange={(e) => setEditingUser({ ...editingUser, specialty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar especialidad</option>
                    <option value="Medicina General">Medicina General</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Pediatría">Pediatría</option>
                    <option value="Ginecología">Ginecología</option>
                    <option value="Dermatología">Dermatología</option>
                    <option value="Oftalmología">Oftalmología</option>
                    <option value="Traumatología">Traumatología</option>
                    <option value="Neurología">Neurología</option>
                    <option value="Psiquiatría">Psiquiatría</option>
                    <option value="Odontología">Odontología</option>
                    <option value="Nutrición">Nutrición</option>
                    <option value="Fisioterapia">Fisioterapia</option>
                    <option value="Urología">Urología</option>
                    <option value="Endocrinología">Endocrinología</option>
                    <option value="Gastroenterología">Gastroenterología</option>
                    <option value="Otorrinolaringología">Otorrinolaringología</option>
                    <option value="Neumología">Neumología</option>
                    <option value="Oncología">Oncología</option>
                    <option value="Reumatología">Reumatología</option>
                    <option value="Cirugía General">Cirugía General</option>
                  </select>
                </div>
              )}

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Usuario activo</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setMessage({ type: '', text: '' });
                  }}
                  disabled={loading}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
