'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, FileText, Download, User } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface NominaConEmpleado {
  id: string;
  mes: string;
  salario_base: number;
  horas_extras: number;
  pago_horas_extras: number;
  dias_faltas: number;
  descuento_faltas: number;
  descuento_ley: number;
  total_neto: number;
  created_at: string;
  empleados: {
    nombre: string;
    puesto: string;
    departamento: string;
    email: string;
  };
}

export default function NominasHistorialPage() {
  const [nominas, setNominas] = useState<NominaConEmpleado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNominas();
  }, []);

  const fetchNominas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('nominas')
      .select('*, empleados(nombre, puesto, departamento, email)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNominas(data as any);
    }
    setLoading(false);
  };

  const descargarReciboPDF = (nom: NominaConEmpleado) => {
    const emp = nom.empleados || { nombre: 'Empleado', puesto: 'N/A', departamento: 'N/A', email: 'N/A' };

    const ventanaImpresion = window.open('', '_blank', 'width=800,height=900');
    if (!ventanaImpresion) {
      alert('Por favor permite las ventanas emergentes (pop-ups) en tu navegador para ver el PDF.');
      return;
    }

    ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Recibo de Nómina - ${emp.nombre}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111; padding: 40px; margin: 0; background: #fff; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
            .company { font-size: 22px; font-weight: bold; color: #1e3a8a; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
            .badge { background: #f1f5f9; padding: 6px 12px; font-size: 11px; font-weight: bold; border-radius: 4px; text-transform: uppercase; }
            .section-title { font-size: 13px; font-weight: bold; color: #334155; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px; margin-top: 25px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .label { color: #64748b; }
            .value { font-weight: bold; color: #0f172a; }
            .total-box { background: #f8fafc; border: 2px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-top: 30px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 14px; font-weight: bold; color: #334155; }
            .total-amount { font-size: 22px; font-weight: bold; color: #16a34a; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">DevForge CRM — RRHH</div>
              <div class="subtitle">Comprobante Oficial de Pago de Nómina</div>
            </div>
            <div class="badge">Periodo: ${nom.mes}</div>
          </div>

          <div class="section-title">Información del Empleado</div>
          <div class="grid">
            <div><strong>Trabajador:</strong> ${emp.nombre}</div>
            <div><strong>Puesto:</strong> ${emp.puesto}</div>
            <div><strong>Departamento:</strong> ${emp.departamento}</div>
            <div><strong>Correo:</strong> ${emp.email}</div>
          </div>

          <div class="section-title">Desglose de Percepciones y Deducciones</div>
          <div class="row">
            <span class="label">Salario Base Mensual</span>
            <span class="value">$${Number(nom.salario_base).toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="label">Pago por Horas Extras (${nom.horas_extras} horas)</span>
            <span class="value" style="color: #16a34a;">+$${Number(nom.pago_horas_extras).toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="label">Descuento por Faltas Injustificadas (${nom.dias_faltas} días)</span>
            <span class="value" style="color: #dc2626;">-$${Number(nom.descuento_faltas).toFixed(2)}</span>
          </div>
          <div class="row">
            <span class="label">Descuentos de Ley (10%)</span>
            <span class="value" style="color: #dc2626;">-$${Number(nom.descuento_ley).toFixed(2)}</span>
          </div>

          <div class="total-box">
            <span class="total-label">TOTAL NETO A PAGAR:</span>
            <span class="total-amount">$${Number(nom.total_neto).toFixed(2)}</span>
          </div>

          <div class="footer">
            Generado automáticamente por DevForge CRM • Emitido el: ${new Date(nom.created_at).toLocaleDateString()}
          </div>

          <script>
            window.print();
          </script>
        </body>
      </html>
    `);
    ventanaImpresion.document.close();
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 font-sans flex flex-col p-6 md:p-8 selection:bg-blue-600 selection:text-white">
      
      {/* Cabecera */}
      <div className="mb-8">
        <Link href="/admin/hr" className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-blue-400 transition mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver al Dashboard de RRHH
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Historial Central de Nóminas PDF</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Sincronizado con Supabase
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Consulta y descarga los recibos de nómina oficiales emitidos a toda la plantilla.</p>
          </div>
        </div>
      </div>

      {/* Tabla de Historial de Nóminas */}
      <div className="bg-[#0d131f] border border-slate-800/85 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Registro General de Recibos Emitidos
          </h3>
          <span className="text-xs font-mono text-slate-400">Total: <strong className="text-white">{nominas.length}</strong> nóminas</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                <th className="py-3.5 px-5">Empleado</th>
                <th className="py-3.5 px-5">Periodo / Mes</th>
                <th className="py-3.5 px-5">Total Neto</th>
                <th className="py-3.5 px-5">Fecha de Emisión</th>
                <th className="py-3.5 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">Cargando nóminas...</td>
                </tr>
              ) : nominas.length > 0 ? (
                nominas.map((nom) => (
                  <tr key={nom.id} className="hover:bg-slate-800/20 transition">
                    <td className="py-3.5 px-5 flex items-center gap-2 text-slate-200 font-semibold">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                      {nom.empleados?.nombre || 'Empleado'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-300">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {nom.mes}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-emerald-400 font-bold">${Number(nom.total_neto).toFixed(2)}</td>
                    <td className="py-3.5 px-5 text-slate-400">{new Date(nom.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => descargarReciboPDF(nom)}
                        className="bg-slate-900 hover:bg-blue-950 text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-blue-800 px-3 py-1.5 rounded-lg transition font-medium text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar / Ver PDF
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No hay nóminas emitidas todavía. Genera la primera desde la ficha de cualquier empleado.
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