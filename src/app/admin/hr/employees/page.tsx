'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, UserPlus, Search, Users } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Empleado {
  id: string;
  nombre: string;
  puesto: string;
  departamento: string;
  correo: string;
  status: string;
}

export default function EmployeesPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error && data) {
      setEmpleados(data);
    }
    setLoading(false);
  };

  const filteredEmpleados = empleados.filter(emp =>
    emp.nombre.toLowerCase().includes(search.toLowerCase()) ||
    emp.puesto.toLowerCase().includes(search.toLowerCase()) ||
    emp.departamento.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 font-sans flex flex-col p-6 md:p-8 selection:bg-blue-600 selection:text-white">
      
      {/* Cabecera */}
      <div className="mb-8">
        <Link href="/admin/hr" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Dashboard de RRHH
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Fichas de Trabajadores</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Sincronizado con Supabase
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Gestiona perfiles, puestos y accede al expediente financiero y de asistencia de la plantilla.</p>
          </div>
          <Link
            href="/admin/hr/employees/new"
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition shadow-md flex items-center gap-2 text-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Añadir Nuevo Empleado</span>
          </Link>
        </div>
      </div>

      {/* Buscador y Total */}
      <div className="bg-[#0d131f] border border-slate-800/80 p-4 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, puesto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-xs font-mono text-slate-400">
          Total: <strong className="text-white">{filteredEmpleados.length}</strong> empleados
        </span>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                <th className="py-3.5 px-5">Empleado</th>
                <th className="py-3.5 px-5">Puesto</th>
                <th className="py-3.5 px-5">Departamento</th>
                <th className="py-3.5 px-5">Correo Corporativo</th>
                <th className="py-3.5 px-5">Estado</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">Cargando empleados...</td>
                </tr>
              ) : filteredEmpleados.length > 0 ? (
                filteredEmpleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3.5 px-5 flex items-center gap-3 text-slate-200 font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-xs font-bold">
                        {emp.nombre.slice(0, 2).toUpperCase()}
                      </div>
                      {emp.nombre}
                    </td>
                    <td className="py-3.5 px-5 text-slate-300 font-medium">{emp.puesto}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                        {emp.departamento}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-mono">{emp.correo}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-full inline-flex items-center gap-1.5 border ${
                        emp.status === 'Activo' 
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60' 
                          : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Activo' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/admin/hr/employees/${emp.id}`}
                        className="bg-slate-900 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-blue-800 px-3 py-1.5 rounded-lg transition font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        Ver Ficha →
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No se encontraron empleados registrados.
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