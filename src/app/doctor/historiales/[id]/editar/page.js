'use client';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Activity, Pill } from 'lucide-react';

export default function EditarHistorialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState(null);
  const [formData, setFormData] = useState({
    consultDate: '',
    reason: '',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    medications: [],
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    nextFollowUp: ''
  });
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchRecord();
    }
  }, [status, session, router]);

  const fetchRecord = async () => {
    try {
      const res = await fetch(`/api/medical-records/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecord(data);
        
        // Populate form with existing data
        setFormData({
          consultDate: data.consultDate.split('T')[0],
          reason: data.reason || '',
          symptoms: data.symptoms || '',
          diagnosis: data.diagnosis || '',
          treatment: data.treatment || '',
          medications: data.medications || [],
          notes: data.notes || '',
          vitalSigns: {
            bloodPressure: data.vitalSigns?.bloodPressure || '',
            heartRate: data.vitalSigns?.heartRate || '',
            temperature: data.vitalSigns?.temperature || '',
            weight: data.vitalSigns?.weight || '',
            height: data.vitalSigns?.height || ''
          },
          nextFollowUp: data.nextFollowUp ? new Date(data.nextFollowUp).toISOString().split('T')[0] : ''
        });
      } else {
        alert('Error al cargar historial');
        router.push('/doctor/historiales');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vitalSigns.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication]
      }));
      setNewMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };

  const handleRemoveMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason || !formData.diagnosis) {
      alert('Por favor completa los campos requeridos: Motivo y Diagnóstico');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/medical-records/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        router.push(`/doctor/historiales/${params.id}`);
      } else {
        const error = await res.json();
        alert(error.error || 'Error al actualizar historial');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar historial');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Historial Médico
          </h1>
          <p className="text-gray-600 mt-2">
            Paciente: {record.patient.name}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Consult Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Consulta
            </label>
            <input
              type="date"
              name="consultDate"
              value={formData.consultDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de Consulta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              placeholder="Ej: Dolor de cabeza persistente"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Síntomas
            </label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              rows={3}
              placeholder="Describe los síntomas del paciente..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Vital Signs */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Signos Vitales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Presión Arterial</label>
                <input
                  type="text"
                  name="vitalSigns.bloodPressure"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={handleChange}
                  placeholder="120/80 mmHg"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia Cardíaca</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="vitalSigns.heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleChange}
                    placeholder="70"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  />
                  <select className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm">
                    <option value="bpm">bpm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    name="vitalSigns.temperature"
                    value={formData.vitalSigns.temperature}
                    onChange={handleChange}
                    placeholder="36.5"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  />
                  <select className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm">
                    <option value="°C">°C</option>
                    <option value="°F">°F</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    name="vitalSigns.weight"
                    value={formData.vitalSigns.weight}
                    onChange={handleChange}
                    placeholder="70"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  />
                  <select className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm">
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altura</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    name="vitalSigns.height"
                    value={formData.vitalSigns.height}
                    onChange={handleChange}
                    placeholder="1.70"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  />
                  <select className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 shadow-sm">
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico <span className="text-red-500">*</span>
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Diagnóstico médico..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Treatment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento
            </label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              rows={3}
              placeholder="Describe el tratamiento recomendado..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Medications */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              Medicamentos Recetados
            </h3>
            
            {/* Medications List */}
            {formData.medications.length > 0 && (
              <div className="mb-6 space-y-3">
                {formData.medications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{med.name}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {med.dosage}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          {med.frequency}
                        </span>
                        {med.duration && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                            {med.duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Medication Form */}
            <div className="bg-white rounded-xl p-5 border-2 border-dashed border-purple-200">
              <p className="text-sm font-medium text-gray-700 mb-4">Agregar nuevo medicamento</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Nombre del medicamento *"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 shadow-sm"
                  />
                </div>
                <div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="500"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 shadow-sm"
                    />
                    <select 
                      className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 font-medium text-gray-700 shadow-sm"
                      onChange={(e) => {
                        const value = newMedication.dosage.replace(/[^0-9.]/g, '');
                        setNewMedication({...newMedication, dosage: value + e.target.value});
                      }}
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="mcg">mcg</option>
                      <option value="UI">UI</option>
                    </select>
                  </div>
                  <label className="block text-xs text-gray-500 mt-1">Dosis *</label>
                </div>
                <div>
                  <select
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                  >
                    <option value="">Seleccionar frecuencia</option>
                    <option value="Cada 4 horas">Cada 4 horas</option>
                    <option value="Cada 6 horas">Cada 6 horas</option>
                    <option value="Cada 8 horas">Cada 8 horas</option>
                    <option value="Cada 12 horas">Cada 12 horas</option>
                    <option value="Cada 24 horas">Cada 24 horas</option>
                    <option value="1 vez al día">1 vez al día</option>
                    <option value="2 veces al día">2 veces al día</option>
                    <option value="3 veces al día">3 veces al día</option>
                    <option value="Antes de dormir">Antes de dormir</option>
                    <option value="Cuando hay dolor">Cuando hay dolor</option>
                    <option value="Según necesidad">Según necesidad</option>
                    <option value="En ayunas">En ayunas</option>
                    <option value="Con alimentos">Con alimentos</option>
                    <option value="custom">Personalizar...</option>
                  </select>
                  {newMedication.frequency === 'custom' && (
                    <input
                      type="text"
                      placeholder="Escribir frecuencia personalizada"
                      onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                      className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 shadow-sm"
                    />
                  )}
                  <label className="block text-xs text-gray-500 mt-1">Frecuencia</label>
                </div>
                <div>
                  <select
                    value={newMedication.duration}
                    onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                  >
                    <option value="">Seleccionar duración</option>
                    <option value="3 días">3 días</option>
                    <option value="5 días">5 días</option>
                    <option value="7 días">7 días</option>
                    <option value="10 días">10 días</option>
                    <option value="14 días">14 días</option>
                    <option value="1 mes">1 mes</option>
                    <option value="Continuo">Continuo</option>
                    <option value="custom">Personalizar...</option>
                  </select>
                  {newMedication.duration === 'custom' && (
                    <input
                      type="text"
                      placeholder="Escribir duración personalizada"
                      onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                      className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 shadow-sm"
                    />
                  )}
                  <label className="block text-xs text-gray-500 mt-1">Duración</label>
                </div>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="md:col-span-2 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Medicamento
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Observaciones, indicaciones especiales..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Next Follow Up */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próxima Cita de Seguimiento
            </label>
            <input
              type="date"
              name="nextFollowUp"
              value={formData.nextFollowUp}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
