'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Calendar, Plus, User, Clock, Briefcase, Trash2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Empleado {
  id: string;
  nombre: string;
}

interface Horario {
  id: string;
  empleado_id: string;
  turno: string;
  jornada: string;
  dias_laborables: string;
  empleados?: { nombre: string };
}

interface Vacacion {
  id: string;
  empleado_id: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias: number;
  status: string;
  created_at: string;
  empleados?: { nombre: string };
}

export default function TimeOffPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [solicitudes, setSolicitudes] = useState<Vacacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados formulario Horario
  const [empHorario, setEmpHorario] = useState('');
  const [turno, setTurno] = useState('09:00 - 18:00');
  const [jornada, setJornada] = useState('Completa');
  const [diasLaborables, setDiasLaborables] = useState('Lunes a Viernes');
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  // Estados formulario Vacaciones / Faltas
  const [selectedEmpleado, setSelectedEmpleado] = useState('');
  const [tipo, setTipo] = useState('Vacaciones');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [dias, setDias] = useState<number>(1);
  const [guardandoVac, setGuardandoVac] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      const start = new Date(fechaInicio);
      const end = new Date(fechaFin);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDias(diffDays > 0 ? diffDays : 1);
    }
  }, [fechaInicio, fechaFin]);

  const fetchData = async () => {
    setLoading(true);
    const { data: empData } = await supabase.from('empleados').select('id, nombre');
    if (empData) setEmpleados(empData);

    const { data: horData } = await supabase
      .from('horarios_empleados')
      .select('*, empleados(nombre)')
      .order('created_at', { ascending: false });
    if (horData) setHorarios(horData);

    const { data: vacData } = await supabase
      .from('vacaciones')
      .select('*, empleados(nombre)')
      .order('created_at', { ascending: false });
    if (vacData) setSolicitudes(vacData);

    setLoading(false);
  };

  const handleSaveHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empHorario) {
      alert('Selecciona un empleado.');
      return;
    }

    setGuardandoHorario(true);
    const { error } = await supabase.from('horarios_empleados').insert([
      { empleado_id: empHorario, turno, jornada, dias_laborables: diasLaborables }
    ]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setEmpHorario('');
      fetchData();
    }
    setGuardandoHorario(false);
  };

  const handleCreateSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpleado || !fechaInicio || !fechaFin) {
      alert('Completa los campos requeridos.');
      return;
    }

    // Si es Falta Injustificada, podemos autoconfigurar su estado como Aprobado/Registrado directamente para que afecte la nómina de inmediato
    const statusInicial = tipo === 'Falta Injustificada' ? 'Aprobado' : 'Pendiente';

    setGuardandoVac(true);
    const { error } = await supabase.from('vacaciones').insert([
      { empleado_id: selectedEmpleado, tipo, fecha_inicio: fechaInicio, fecha_fin: fechaFin, dias: Number(dias), status: statusInicial }
    ]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setSelectedEmpleado('');
      setFechaInicio('');
      setFechaFin('');
      fetchData();
    }
    setGuardandoVac(false);
  };

  const updateStatus = async (id: string, nuevoStatus: string) => {
    await supabase.from('vacaciones').update({ status: nuevoStatus }).eq('id', id);
    fetchData();
  };

  const deleteSolicitud = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      await supabase.from('vacaciones').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 font-sans flex flex-col p-6 md:p-8 selection:bg-amber-600 selection:text-white">
      
      {/* Cabecera */}
      <div className="mb-6">
        <Link href="/admin/hr" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 transition mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Dashboard de RRHH
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Horarios y Vacaciones (PTO)</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Gestión de Turnos y Ausencias
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Asigna jornadas laborales semanales y controla las solicitudes de permisos o faltas de la plantilla.</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: ASIGNACIÓN DE HORARIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-xl shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Asignar Jornada y Turno
          </h3>
          <form onSubmit={handleSaveHorario} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Empleado:</label>
              <select
                value={empHorario}
                onChange={(e) => setEmpHorario(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">-- Seleccionar --</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Días Laborables:</label>
              <input
                type="text"
                value={diasLaborables}
                onChange={(e) => setDiasLaborables(e.target.value)}
                placeholder="Ej. Lunes a Viernes"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Turno (Horas):</label>
                <input
                  type="text"
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  placeholder="09:00 - 18:00"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Jornada:</label>
                <select
                  value={jornada}
                  onChange={(e) => setJornada(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Completa">Completa</option>
                  <option value="Parcial">Parcial</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={guardandoHorario}
              className="w-full mt-2 bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-lg transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{guardandoHorario ? 'Guardando...' : 'Asignar Horario'}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-[#0d131f] border border-slate-800/80 rounded-xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" /> Horarios Asignados a la Plantilla
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: <strong className="text-white">{horarios.length}</strong></span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Empleado</th>
                  <th className="py-3 px-4">Días Laborables</th>
                  <th className="py-3 px-4">Turno</th>
                  <th className="py-3 px-4">Jornada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {horarios.length > 0 ? (
                  horarios.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {h.empleados?.nombre || 'Empleado'}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{h.dias_laborables}</td>
                      <td className="py-3 px-4 text-amber-400 font-mono font-medium">{h.turno}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/60 font-mono text-[10px]">
                          {h.jornada}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500 font-mono">
                      No hay horarios asignados todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SECCIÓN 2: REGISTRAR VACACIONES, PERMISOS O FALTAS */}
      <div className="bg-[#0d131f] border border-slate-800/80 p-6 rounded-xl shadow-xl mb-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" /> Registrar Solicitud o Falta Injustificada
        </h3>
        <form onSubmit={handleCreateSolicitud} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Empleado:</label>
            <select
              value={selectedEmpleado}
              onChange={(e) => setSelectedEmpleado(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- Seleccionar --</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-300 font-medium block mb-1">Tipo:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Vacaciones">Vacaciones</option>
              <option value="Permiso Médico">Permiso Médico</option>
              <option value="Asuntos Personales">Asuntos Personales</option>
              <option value="Falta Injustificada">Falta Injustificada</option>
            </select>
          </div>
          <div>
            <label className="text-slate-300 font-medium block mb-1">Fecha Inicio:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-slate-300 font-medium block mb-1">Fecha Fin:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-slate-300 font-medium block mb-1">Total Días:</label>
            <input
              type="number"
              min="1"
              value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={guardandoVac}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium py-2 rounded-lg transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{guardandoVac ? 'Guardando...' : 'Registrar'}</span>
          </button>
        </form>
      </div>

      {/* Historial de Solicitudes y Faltas */}
      <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Historial de Solicitudes y Faltas</h3>
          <span className="text-xs font-mono text-slate-400">Total: <strong className="text-white">{solicitudes.length}</strong></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                <th className="py-3 px-5">Empleado</th>
                <th className="py-3 px-5">Tipo</th>
                <th className="py-3 px-5">Desde</th>
                <th className="py-3 px-5">Hasta</th>
                <th className="py-3 px-5">Días</th>
                <th className="py-3 px-5">Estado</th>
                <th className="py-3 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {solicitudes.length > 0 ? (
                solicitudes.map((sol) => (
                  <tr key={sol.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3.5 px-5 flex items-center gap-2 text-slate-200 font-semibold">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      {sol.empleados?.nombre || 'Empleado'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-300 font-mono">{sol.tipo}</td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono">{sol.fecha_inicio}</td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono">{sol.fecha_fin}</td>
                    <td className="py-3.5 px-5 text-slate-200 font-bold font-mono">{sol.dias} días</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-full inline-flex items-center gap-1.5 border ${
                        sol.status === 'Aprobado' 
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' 
                          : sol.status === 'Rechazado'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                          : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      }`}>
                        {sol.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      {sol.status === 'Pendiente' && (
                        <>
                          <button
                            onClick={() => updateStatus(sol.id, 'Aprobado')}
                            className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-lg transition font-medium text-[11px] cursor-pointer"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => updateStatus(sol.id, 'Rechazado')}
                            className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 px-2.5 py-1 rounded-lg transition font-medium text-[11px] cursor-pointer"
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {sol.status !== 'Pendiente' && (
                        <button
                          onClick={() => updateStatus(sol.id, 'Pendiente')}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg transition font-medium text-[11px] cursor-pointer"
                        >
                          Reabrir (Pendiente)
                        </button>
                      )}

                      <button
                        onClick={() => deleteSolicitud(sol.id)}
                        className="bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800 p-1 rounded-lg transition cursor-pointer inline-flex items-center align-middle"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                    No hay solicitudes ni faltas registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}