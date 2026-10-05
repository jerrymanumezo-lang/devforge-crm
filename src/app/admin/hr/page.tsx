'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Users, Briefcase, Calendar, Star, FileText, CheckSquare, ArrowLeft } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HRDashboard() {
  const [totalEmpleados, setTotalEmpleados] = useState(0);
  const [empleadosActivos, setEmpleadosActivos] = useState(0);
  const [departamentosUnicos, setDepartamentosUnicos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('empleados')
      .select('status, departamento');

    if (!error && data) {
      setTotalEmpleados(data.length);
      const activos = data.filter(e => e.status === 'Activo').length;
      setEmpleadosActivos(activos);
      
      const depts = new Set(data.map(e => e.departamento).filter(Boolean));
      setDepartamentosUnicos(depts.size);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 font-sans flex flex-col p-6 md:p-8 selection:bg-blue-600 selection:text-white">
      
      {/* Botón de retorno y Cabecera */}
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Admin Principal
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Módulo de Recursos Humanos</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                RRHH Pro Sincronizado
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Control de personal y estadísticas conectadas directamente con Supabase.</p>
          </div>
          <div>
            <span className="px-3 py-1.5 bg-[#0d131f] text-emerald-400 font-mono text-xs rounded-lg border border-emerald-500/30 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Supabase Database Conectada
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-xl shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Empleados Activos</p>
          <h3 className="text-3xl font-bold text-white mt-2 font-mono">
            {loading ? '...' : empleadosActivos}
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
            De {totalEmpleados} registrados en total
          </span>
        </div>

        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-xl shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Departamentos</p>
          <h3 className="text-3xl font-bold text-white mt-2 font-mono">
            {loading ? '...' : departamentosUnicos}
          </h3>
          <span className="text-[11px] text-blue-400 mt-1 inline-block">Áreas operativas activas</span>
        </div>

        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-xl shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Evaluaciones Trimestrales</p>
          <h3 className="text-3xl font-bold text-white mt-2 font-mono">4.2 / 5</h3>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">Promedio general Q2</span>
        </div>

        <div className="bg-[#0d131f] border border-slate-800/80 p-5 rounded-xl shadow-lg">
          <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Nóminas & Documentos</p>
          <h3 className="text-3xl font-bold text-white mt-2 font-mono">100%</h3>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">Firmadas y subidas</span>
        </div>

      </div>

      {/* Accesos Directos / Secciones del Módulo */}
      <h2 className="text-sm font-mono tracking-wider uppercase text-slate-400 mb-4">Gestión y Procesos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Ficha y Empleados */}
        <Link href="/admin/hr/employees" className="bg-[#0d131f] border border-slate-800/80 hover:border-blue-500/50 p-5 rounded-xl shadow-lg transition group cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">Fichas de Trabajadores</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Consulta perfiles, puestos, correos corporativos y estado activo directamente de Supabase.</p>
          </div>
          <span className="text-[11px] font-mono text-blue-400 mt-4 inline-flex items-center gap-1">Acceder al listado →</span>
        </Link>

        {/* Proceso de Admisión / Contratación */}
        <div className="bg-[#0d131f] border border-slate-800/80 hover:border-blue-500/50 p-5 rounded-xl shadow-lg transition group cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">Proceso de Admisión</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Pipeline con CVs. Contrata candidatos y genera su ficha automáticamente.</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-4">Próximamente</span>
        </div>

        {/* Horarios y Vacaciones */}
        <Link href="/admin/hr/timeoff" className="bg-[#0d131f] border border-slate-800/80 hover:border-blue-500/50 p-5 rounded-xl shadow-lg transition group cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">Horarios y Vacaciones</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Control de fichajes de entrada/salida y solicitudes de permisos o vacaciones (PTO).</p>
          </div>
          <span className="text-[11px] font-mono text-amber-400 mt-4 inline-flex items-center gap-1">Gestionar vacaciones →</span>
        </Link>

        {/* Evaluaciones */}
        <div className="bg-[#0d131f] border border-slate-800/80 hover:border-blue-500/50 p-5 rounded-xl shadow-lg transition group cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-105 transition">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">Evaluaciones Trimestrales</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Calificaciones del 1 al 5 por trimestre con comentarios de desempeño detallados.</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-4">Próximamente</span>
        </div>

        {/* Nóminas y Documentos PDF */}
        <Link href="/admin/hr/payroll" className="bg-[#0d131f] border border-slate-800/80 hover:border-blue-500/50 p-5 rounded-xl shadow-lg transition group cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">Nóminas y Documentos PDF</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Subida de nóminas en PDF, control de firmas digitales y contratos de empleados.</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 mt-4 inline-flex items-center gap-1">Gestionar nóminas →</span>
        </Link>

        {/* Check de inicio / Onboarding */}
        <div className="bg-[#0d131f] border border-slate-800/80 hover:border-blue-500/50 p-5 rounded-xl shadow-lg transition group cursor-pointer flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition">Checklist de Onboarding</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Tareas del primer día: entrega de portátil, creación de correo y accesos iniciales.</p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-4">Próximamente</span>
        </div>

      </div>
    </div>
  );
}