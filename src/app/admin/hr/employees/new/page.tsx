'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, UserPlus } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NuevoEmpleadoPage() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState('');
  const [puesto, setPuesto] = useState('');
  const [departamento, setDepartamento] = useState('Tecnología');
  const [correo, setCorreo] = useState('');
  const [salarioBase, setSalarioBase] = useState('1500');
  const [status, setStatus] = useState('Activo');
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !puesto || !correo) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    setGuardando(true);
    // Aquí cambiamos 'correo' por 'email' para que coincida con tu tabla de Supabase
    const { error } = await supabase.from('empleados').insert([
      {
        nombre,
        puesto,
        departamento,
        email: correo, 
        salario_base: Number(salarioBase),
        status
      }
    ]);

    if (error) {
      alert(`Error al registrar empleado: ${error.message}`);
      setGuardando(false);
    } else {
      alert('¡Empleado registrado con éxito!');
      router.push('/admin/hr/employees');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 font-sans flex flex-col p-6 md:p-8 selection:bg-blue-600 selection:text-white">
      
      {/* Cabecera */}
      <div className="mb-6">
        <Link href="/admin/hr/employees" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Listado
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Añadir Nuevo Empleado</h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Registro de Plantilla
          </span>
        </div>
        <p className="text-slate-400 text-xs mt-1">Completa los datos contractuales y el salario base para el control de nómina.</p>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl bg-[#0d131f] border border-slate-800/80 p-6 rounded-xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="text-slate-300 font-medium block mb-1">Nombre Completo del Trabajador:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Carlos Mendoza Ruiz"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Puesto / Cargo:</label>
              <input
                type="text"
                value={puesto}
                onChange={(e) => setPuesto(e.target.value)}
                placeholder="Ej. Desarrollador Frontend"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Departamento:</label>
              <select
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Tecnología">Tecnología</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Administración">Administración</option>
                <option value="Ventas y Marketing">Ventas y Marketing</option>
                <option value="Operaciones">Operaciones</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Correo Corporativo:</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="carlos.mendoza@devforge.com"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Salario Base Mensual ($):</label>
              <input
                type="number"
                step="0.01"
                value={salarioBase}
                onChange={(e) => setSalarioBase(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Estado Inicial:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link
              href="/admin/hr/employees"
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg transition font-medium"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-lg transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{guardando ? 'Guardando...' : 'Registrar Empleado'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}