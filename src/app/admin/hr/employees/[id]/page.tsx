'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, User, Calendar, FileText, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Empleado {
  id: string;
  nombre: string;
  puesto: string;
  departamento: string;
  email: string;
  status: string;
  salario_base: number;
}

interface Vacacion {
  id: string;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias: number;
  status: string;
}

interface Nomina {
  id: string;
  mes: string;
  total_neto: number;
  created_at: string;
}

export default function FichaEmpleadoPage() {
  const params = useParams();
  const empleadoId = params.id as string;

  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [ausencias, setAusencias] = useState<Vacacion[]>([]);
  const [historialNominas, setHistorialNominas] = useState<Nomina[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para cálculo de nómina mensual
  const [mesSeleccionado, setMesSeleccionado] = useState('Octubre 2026');
  const [horasExtras, setHorasExtras] = useState<number>(0);
  const [nominaGenerada, setNominaGenerada] = useState<any | null>(null);
  const [guardandoNomina, setGuardandoNomina] = useState(false);

  useEffect(() => {
    if (empleadoId) {
      fetchEmpleadoData();
    }
  }, [empleadoId]);

  const fetchEmpleadoData = async () => {
    setLoading(true);
    const { data: empData, error: empError } = await supabase
      .from('empleados')
      .select('*')
      .eq('id', empleadoId)
      .single();

    if (!empError && empData) {
      setEmpleado(empData);
    }

    const { data: vacData } = await supabase
      .from('vacaciones')
      .select('*')
      .eq('empleado_id', empleadoId)
      .order('fecha_inicio', { ascending: false });

    if (vacData) {
      setAusencias(vacData);
    }

    const { data: nomData } = await supabase
      .from('nominas')
      .select('*')
      .eq('empleado_id', empleadoId)
      .order('created_at', { ascending: false });

    if (nomData) {
      setHistorialNominas(nomData);
    }

    setLoading(false);
  };

  const calcularNomina = () => {
    if (!empleado) return;

    const salarioBase = Number(empleado.salario_base || 1500);
    const diasFaltasInjustificadas = ausencias
      .filter(a => a.tipo === 'Falta Injustificada')
      .reduce((acc, curr) => acc + curr.dias, 0);

    const valorPorDia = salarioBase / 30;
    const descuentoFaltas = diasFaltasInjustificadas * valorPorDia;
    const pagoHorasExtras = Number(horasExtras) * 15;
    const descuentoLey = salarioBase * 0.10;
    const totalNeto = salarioBase - descuentoFaltas + pagoHorasExtras - descuentoLey;

    const resultado = {
      mes: mesSeleccionado,
      salarioBase,
      diasFaltas: diasFaltasInjustificadas,
      descuentoFaltas: Number(descuentoFaltas.toFixed(2)),
      horasExtras: Number(horasExtras),
      pagoHorasExtras: Number(pagoHorasExtras.toFixed(2)),
      descuentoLey: Number(descuentoLey.toFixed(2)),
      totalNeto: Number(totalNeto > 0 ? totalNeto.toFixed(2) : 0)
    };

    setNominaGenerada(resultado);
  };

  // Guardar exclusivamente en Supabase sin abrir PDF
  const guardarNominaEnSistema = async () => {
    if (!nominaGenerada || !empleado) return;

    setGuardandoNomina(true);

    const { error } = await supabase.from('nominas').insert([
      {
        empleado_id: empleadoId,
        mes: nominaGenerada.mes,
        salario_base: nominaGenerada.salarioBase,
        horas_extras: nominaGenerada.horasExtras,
        pago_horas_extras: nominaGenerada.pagoHorasExtras,
        dias_faltas: nominaGenerada.diasFaltas,
        descuento_faltas: nominaGenerada.descuentoFaltas,
        descuento_ley: nominaGenerada.descuentoLey,
        total_neto: nominaGenerada.totalNeto
      }
    ]);

    if (error) {
      alert(`Error al guardar nómina: ${error.message}`);
      setGuardandoNomina(false);
      return;
    }

    fetchEmpleadoData();
    setGuardandoNomina(false);
    alert('¡Nómina guardada en el sistema con éxito! Ya puedes consultarla en el historial general.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex items-center justify-center font-mono text-xs">
        Cargando expediente del trabajador...
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-slate-200 flex flex-col items-center justify-center font-mono text-xs">
        <p className="mb-4">Empleado no encontrado.</p>
        <Link href="/admin/hr/employees" className="text-blue-400 underline">Volver al listado</Link>
      </div>
    );
  }

  const totalFaltasAcumuladas = ausencias
    .filter(a => a.tipo === 'Falta Injustificada')
    .reduce((acc, curr) => acc + curr.dias, 0);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 font-sans flex flex-col p-6 md:p-8 selection:bg-blue-600 selection:text-white">
      
      {/* Cabecera */}
      <div className="mb-6">
        <Link href="/admin/hr/employees" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Listado de Empleados
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Ficha del Trabajador</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                empleado.status === 'Activo' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {empleado.status}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Expediente laboral, control de faltas y cálculo de nómina mensual.</p>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Datos y Salario */}
        <div className="bg-[#0d131f] border border-slate-800/80 p-6 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <User className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">{empleado.nombre}</h2>
            <p className="text-xs text-blue-400 font-mono mt-0.5">{empleado.puesto} • {empleado.departamento}</p>
            <p className="text-xs text-slate-400 mt-3">{empleado.email}</p>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Salario Base:</span>
                <strong className="text-white font-mono text-sm">${Number(empleado.salario_base || 1500).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Faltas Injustificadas:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  totalFaltasAcumuladas > 0 ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-emerald-400'
                }`}>
                  {totalFaltasAcumuladas} días
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Faltas */}
        <div className="lg:col-span-2 bg-[#0d131f] border border-slate-800/80 p-6 rounded-xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" /> Historial de Asistencia y Faltas Registradas
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Desde</th>
                    <th className="py-2.5 px-3">Hasta</th>
                    <th className="py-2.5 px-3">Días</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {ausencias.length > 0 ? (
                    ausencias.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-800/20">
                        <td className="py-3 px-3 font-semibold text-slate-200 flex items-center gap-1.5">
                          {a.tipo === 'Falta Injustificada' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                          {a.tipo}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">{a.fecha_inicio}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{a.fecha_fin}</td>
                        <td className="py-3 px-3 font-mono font-bold text-white">{a.dias} días</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                            a.tipo === 'Falta Injustificada'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}>
                            {a.tipo === 'Falta Injustificada' ? 'Registrada' : a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                        No hay registros de faltas para este empleado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* GENERADOR DE NÓMINA */}
      <div className="bg-[#0d131f] border border-slate-800/80 p-6 rounded-xl shadow-2xl mb-8">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" /> Generador de Nómina y Registro en Base de Datos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs items-end">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Periodo / Mes:</label>
            <input
              type="text"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-slate-300 font-medium block mb-1">Horas Extras:</label>
            <input
              type="number"
              min="0"
              value={horasExtras}
              onChange={(e) => setHorasExtras(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={calcularNomina}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg transition shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            Calcular Nómina del Mes
          </button>
        </div>

        {/* Resultado del Cálculo */}
        {nominaGenerada && (
          <div className="mt-6 pt-6 border-t border-slate-800 bg-slate-900/40 p-5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-white text-sm">Desglose de Nómina — {nominaGenerada.mes}</h4>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full font-mono text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Listo para guardar en sistema
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase">Salario Base</p>
                <p className="text-white text-base font-bold mt-1">${nominaGenerada.salarioBase.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase">Horas Extras ({nominaGenerada.horasExtras}h)</p>
                <p className="text-emerald-400 text-base font-bold mt-1">+${nominaGenerada.pagoHorasExtras.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase">Descuento Faltas ({nominaGenerada.diasFaltas}d)</p>
                <p className="text-rose-400 text-base font-bold mt-1">-${nominaGenerada.descuentoFaltas.toFixed(2)}</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <p className="text-slate-400 text-[10px] uppercase">Descuentos de Ley (10%)</p>
                <p className="text-rose-400 text-base font-bold mt-1">-${nominaGenerada.descuentoLey.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center bg-[#0b0f17] p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Total Neto a Pagar a <strong className="text-white">{empleado.nombre}</strong>:</p>
                <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-0.5">${nominaGenerada.totalNeto.toFixed(2)}</h3>
              </div>
              <button
                onClick={guardarNominaEnSistema}
                disabled={guardandoNomina}
                className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-2.5 px-5 rounded-lg transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{guardandoNomina ? 'Guardando...' : 'Guardar Nómina en el Sistema'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HISTORIAL DE NÓMINAS */}
      <div className="bg-[#0d131f] border border-slate-800/80 p-6 rounded-xl shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" /> Historial de Nóminas Emitidas
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Periodo</th>
                <th className="py-2.5 px-3">Total Neto Pagado</th>
                <th className="py-2.5 px-3">Fecha de Emisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {historialNominas.length > 0 ? (
                historialNominas.map((nom) => (
                  <tr key={nom.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-3 font-semibold text-slate-200">{nom.mes}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">${Number(nom.total_neto).toFixed(2)}</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(nom.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No hay nóminas guardadas todavía para este empleado.
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