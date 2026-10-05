'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Mail, 
  Phone, 
  RefreshCw, 
  Search,
  Sparkles,
  UserPlus,
  Check,
  Trash2,
  LogOut,
  DollarSign,
  TrendingUp,
  Percent,
  PieChart,
  UserCheck,
  UserCog,
  X,
  Save,
  Download
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  tipo_proyecto: string;
  mensaje: string;
  estado: string;
  es_contacto?: boolean;
  created_at: string;
  notas?: string;
  presupuesto?: number;
  empleado_asignado?: string;
}

export default function AdminCRM() {
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [listaEmpleados, setListaEmpleados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'oportunidades' | 'contactos' | 'empresas'>('oportunidades');
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const router = useRouter();

  // Estados para el Modal de Detalle
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notas, setNotas] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [empleadoAsignado, setEmpleadoAsignado] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkUserAndFetch();
    fetchEmpleadosActivos();
  }, []);

  const checkUserAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    fetchLeads();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar los registros:', error.message);
      setLoading(false);
    } else {
      setLeads(data || []);
      setLoading(false);
    }
  };

  const fetchEmpleadosActivos = async () => {
    const { data, error } = await supabase
      .from('empleados')
      .select('nombre')
      .eq('status', 'Activo');

    if (!error && data) {
      setListaEmpleados(data.map(e => e.nombre));
    }
  };

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    const esContactoNuevo = (nuevoEstado === 'En proceso' || nuevoEstado === 'Cerrado') ? true : undefined;

    setLeads(prevLeads =>
      prevLeads.map(lead => 
        lead.id === id 
          ? { ...lead, estado: nuevoEstado, ...(esContactoNuevo !== undefined ? { es_contacto: true } : {}) } 
          : lead
      )
    );

    const payload: { estado: string; es_contacto?: boolean } = { estado: nuevoEstado };
    if (nuevoEstado === 'En proceso' || nuevoEstado === 'Cerrado') {
      payload.es_contacto = true;
    }

    const { error } = await supabase
      .from('leads')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar estado en Supabase:', error.message);
      fetchLeads();
    }
  };

  const agregarAContactos = async (id: string) => {
    setLeads(prevLeads =>
      prevLeads.map(lead => lead.id === id ? { ...lead, es_contacto: true } : lead)
    );

    const { error } = await supabase
      .from('leads')
      .update({ es_contacto: true })
      .eq('id', id);

    if (error) {
      console.error('Error al agregar a contactos en Supabase:', error.message);
      fetchLeads();
    }
  };

  const removerDeContactos = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas quitar este contacto de la sección de contactos? Se mantendrá en oportunidades.')) return;

    setLeads(prevLeads =>
      prevLeads.map(lead => lead.id === id ? { ...lead, es_contacto: false } : lead)
    );

    const { error } = await supabase
      .from('leads')
      .update({ es_contacto: false })
      .eq('id', id);

    if (error) {
      console.error('Error al remover de contactos en Supabase:', error.message);
      fetchLeads();
    }
  };

  const handleOpenModal = (lead: Lead) => {
    setSelectedLead(lead);
    setNotas(lead.notas || '');
    setPresupuesto(lead.presupuesto !== undefined && lead.presupuesto !== null ? lead.presupuesto.toString() : '');
    setEmpleadoAsignado(lead.empleado_asignado || '');
  };

  const handleSaveDetails = async () => {
    if (!selectedLead) return;
    setGuardando(true);

    const presupuestoNum = presupuesto !== '' ? parseFloat(presupuesto) : 0;
    const asignadoFinal = (empleadoAsignado && empleadoAsignado !== '' && empleadoAsignado !== 'EMPTY') ? empleadoAsignado : null;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          notas: notas, 
          presupuesto: presupuestoNum,
          empleado_asignado: asignadoFinal
        })
        .eq('id', selectedLead.id);

      if (error) throw error;

      setLeads(prevLeads =>
        prevLeads.map(l => {
          if (l.id === selectedLead.id) {
            return { 
              ...l, 
              notas: notas, 
              presupuesto: presupuestoNum,
              empleado_asignado: asignadoFinal || undefined
            };
          }
          return l;
        })
      );

      setSelectedLead(null);
    } catch (error) {
      console.error('Error al guardar detalles:', error);
      alert('Hubo un error al guardar los detalles.');
    } finally {
      setGuardando(false);
    }
  };

  const exportarCSV = () => {
    if (leads.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ['Nombre', 'Email', 'Telefono', 'Empresa', 'Tipo Proyecto', 'Estado', 'Presupuesto', 'Empleado Asignado', 'Fecha'];
    const rows = leads.map(l => [
      `"${l.nombre || ''}"`,
      `"${l.email || ''}"`,
      `"${l.telefono || ''}"`,
      `"${l.empresa || ''}"`,
      `"${l.tipo_proyecto || ''}"`,
      `"${l.estado || 'Nuevo'}"`,
      l.presupuesto || 0,
      `"${l.empleado_asignado || 'Sin asignar'}"`,
      `"${l.created_at ? new Date(l.created_at).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_crm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  const totalOportunidadesCount = leads.length;
  const todosLosContactosGlobal = leads.filter(lead => lead.es_contacto === true || lead.estado === 'En proceso' || lead.estado === 'Cerrado');
  const totalContactosCount = todosLosContactosGlobal.length;
  const totalEmpresasCount = Array.from(
    new Set(todosLosContactosGlobal.map(l => l.empresa?.trim()).filter(Boolean))
  ).length;

  const ingresosEstimados = leads
    .filter(l => l.estado === 'En proceso' || l.estado === 'Cerrado')
    .reduce((acc, curr) => acc + (Number(curr.presupuesto) || 0), 0);

  const leadsConvertidos = leads.filter(l => l.estado === 'En proceso' || l.estado === 'Cerrado').length;
  const tasaConversion = totalOportunidadesCount > 0 
    ? Math.round((leadsConvertidos / totalOportunidadesCount) * 100) 
    : 0;

  const proyectosConteo = leads.reduce((acc: Record<string, number>, curr) => {
    const tipo = curr.tipo_proyecto || 'General';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.tipo_proyecto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.empleado_asignado?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = estadoFilter === 'todos' || (lead.estado || 'Nuevo') === estadoFilter;

    return matchesSearch && matchesEstado;
  });

  const contactosList = todosLosContactosGlobal.filter(lead => {
    const matchesSearch = 
      lead.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.empresa?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = estadoFilter === 'todos' || (lead.estado || 'Nuevo') === estadoFilter;

    return matchesSearch && matchesEstado;
  });

  const empresasUnicas = Array.from(
    new Set(todosLosContactosGlobal.map(l => l.empresa?.trim()).filter(Boolean))
  ).map(nombreEmpresa => {
    const leadsEmpresa = todosLosContactosGlobal.filter(l => l.empresa?.trim().toLowerCase() === nombreEmpresa?.toLowerCase());
    return {
      nombre: nombreEmpresa,
      totalContactos: leadsEmpresa.length,
      contactos: leadsEmpresa
    };
  }).filter(empresa => {
    const contactosFiltrados = empresa.contactos.filter(l => {
      const matchesEstado = estadoFilter === 'todos' || (l.estado || 'Nuevo') === estadoFilter;
      return matchesEstado;
    });

    const matchesSearch = empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    return contactosFiltrados.length > 0 && matchesSearch;
  });

  const getBadgeStyle = (estado: string) => {
    switch (estado) {
      case 'Nuevo':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 ring-emerald-500/20';
      case 'En proceso':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60 ring-amber-500/20';
      case 'Cerrado':
        return 'bg-rose-950/60 text-rose-400 border-rose-800/60 ring-rose-500/20';
      default:
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 ring-emerald-500/20';
    }
  };

  const getDotStyle = (estado: string) => {
    switch (estado) {
      case 'Nuevo':
        return 'bg-emerald-400 animate-pulse';
      case 'En proceso':
        return 'bg-amber-400';
      case 'Cerrado':
        return 'bg-rose-500';
      default:
        return 'bg-emerald-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-200 font-sans flex flex-col md:flex-row antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0d131f] border-b md:border-b-0 md:border-r border-slate-800/60 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-7">
          <div className="flex items-center gap-3 px-2 pt-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-100 text-sm tracking-tight leading-none">DevForge</span>
              <span className="text-[11px] text-slate-500 font-mono mt-1">Espacio de trabajo Pro v2.4</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-2 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Módulos CRM</p>
            
            <button
              onClick={() => { setActiveTab('oportunidades'); setEstadoFilter('todos'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'oportunidades'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>Oportunidades</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                {totalOportunidadesCount}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('contactos'); setEstadoFilter('todos'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'contactos'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>Contactos</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                {totalContactosCount}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('empresas'); setEstadoFilter('todos'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                activeTab === 'empresas'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Empresas</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                {totalEmpresasCount}
              </span>
            </button>

            {/* Enlace directo al Módulo de Recursos Humanos */}
            <div className="pt-3 mt-3 border-t border-slate-800/60">
              <p className="px-2 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Gestión Interna</p>
              <Link
                href="/admin/hr"
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/60 hover:text-blue-400 border border-transparent hover:border-slate-700/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <UserCog className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                  <span>Recursos Humanos</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/50">
                  RRHH
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-800/60 hidden md:block">
          <button
            onClick={fetchLeads}
            className="w-full bg-slate-900 hover:bg-slate-800/80 text-slate-300 border border-slate-800 px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 shrink-0 ${loading ? 'animate-spin' : ''}`} />
            <span>Sincronizar base</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-900/50 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 capitalize tracking-tight">
                {activeTab}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Directo de Supabase (leads)
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Panel de control operativo y seguimiento en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            <button
              onClick={exportarCSV}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm cursor-pointer"
              title="Exportar base de datos a CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar CSV</span>
            </button>

            <div className="flex items-center bg-[#0d131f] border border-slate-800 rounded-lg p-1 text-xs">
              {['todos', 'Nuevo', 'En proceso', 'Cerrado'].map((st) => (
                <button
                  key={st}
                  onClick={() => setEstadoFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    estadoFilter === st
                      ? 'bg-slate-800 text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Filtrar ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0d131f] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 w-48 sm:w-60 transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- TARJETAS DE MÉTRICAS Y KPIS --- */}
        {activeTab === 'oportunidades' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Ingresos Estimados</p>
                <h3 className="text-2xl font-bold text-white font-mono">${ingresosEstimados.toLocaleString()}</h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> De proyectos en curso y cerrados
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Tasa de Conversión</p>
                <h3 className="text-2xl font-bold text-white font-mono">{tasaConversion}%</h3>
                <p className="text-[11px] text-blue-400 flex items-center gap-1 font-medium">
                  <Percent className="w-3.5 h-3.5" /> Leads gestionados activamente
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-lg">
              <div className="space-y-2">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Tipos de Proyecto</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(proyectosConteo).map(([tipo, count]) => (
                    <span key={tipo} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {tipo}: <strong className="text-blue-400">{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <PieChart className="w-6 h-6" />
              </div>
            </div>

          </div>
        )}

        {/* VISTA 1: OPORTUNIDADES */}
        {activeTab === 'oportunidades' && (
          <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/40 text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-5 font-medium">Contacto</th>
                    <th className="py-3.5 px-5 font-medium">Tipo Proyecto</th>
                    <th className="py-3.5 px-5 font-medium">Responsable Asignado</th>
                    <th className="py-3.5 px-5 font-medium">Estado</th>
                    <th className="py-3.5 px-5 font-medium text-center">Acción Contacto</th>
                    <th className="py-3.5 px-5 font-medium text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-mono text-xs">
                        No hay registros que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const estadoActual = lead.estado || 'Nuevo';
                      return (
                        <tr key={lead.id} className="hover:bg-slate-800/20 transition-colors group">
                          
                          <td className="py-3.5 px-5">
                            <button 
                              onClick={() => handleOpenModal(lead)}
                              className="font-semibold text-slate-100 hover:text-blue-400 transition-colors text-left cursor-pointer"
                            >
                              {lead.nombre}
                            </button>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{lead.email}</span>
                              {lead.empresa && lead.empresa !== 'VACÍO' && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-slate-400 font-medium">{lead.empresa}</span>
                                </>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]">
                              {lead.tipo_proyecto || 'General'}
                            </span>
                          </td>

                          <td className="py-3.5 px-5">
                            {lead.empleado_asignado ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-800/50 font-medium text-[11px]">
                                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{lead.empleado_asignado}</span>
                              </span>
                            ) : (
                              <span className="text-slate-500 font-mono text-[11px] italic">
                                Sin asignar
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-5">
                            <div className="relative inline-block text-left">
                              <select
                                value={estadoActual}
                                onChange={(e) => actualizarEstado(lead.id, e.target.value)}
                                className={`appearance-none font-mono text-[11px] font-medium rounded-full px-3 py-1 pl-6 pr-6 border ring-1 focus:outline-none cursor-pointer transition-all z-10 relative ${getBadgeStyle(
                                  estadoActual
                                )}`}
                              >
                                <option value="Nuevo" className="bg-[#0d131f] text-emerald-400">Nuevo</option>
                                <option value="En proceso" className="bg-[#0d131f] text-amber-300">En proceso</option>
                                <option value="Cerrado" className="bg-[#0d131f] text-rose-400">Cerrado</option>
                              </select>
                              <span className={`w-1.5 h-1.5 rounded-full absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-20 ${getDotStyle(estadoActual)}`} />
                            </div>
                          </td>

                          <td className="py-3.5 px-5 text-center">
                            {lead.es_contacto ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-800/50 text-[11px] font-medium">
                                <Check className="w-3 h-3" />
                                <span>En contactos</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => agregarAContactos(lead.id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 border border-slate-700 text-[11px] font-medium transition-all shadow-sm cursor-pointer"
                              >
                                <UserPlus className="w-3 h-3 text-blue-400 group-hover:text-white" />
                                <span>Agregar a contactos</span>
                              </button>
                            )}
                          </td>

                          <td className="py-3.5 px-5 text-right font-mono text-[11px] text-slate-400">
                            {lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'Reciente'}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA 2: CONTACTOS */}
        {activeTab === 'contactos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contactosList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">
                Aún no hay contactos agregados que coincidan con este filtro.
              </div>
            ) : (
              contactosList.map((contact) => {
                const estadoActual = contact.estado || 'Nuevo';
                return (
                  <div key={contact.id} className="bg-[#0d131f] border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 space-y-3 shadow-lg transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-mono font-bold flex items-center justify-center text-xs">
                            {contact.nombre ? contact.nombre.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-100 text-xs">{contact.nombre}</h3>
                            <p className="text-[11px] text-slate-400 font-mono">{contact.empresa && contact.empresa !== 'VACÍO' ? contact.empresa : 'Particular'}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => removerDeContactos(contact.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Quitar de contactos (se mantiene en oportunidades)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-3 mt-3 border-t border-slate-800/50 text-[11px] text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        {contact.telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{contact.telefono}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-1 border-t border-slate-800/40 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Estado:</span>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-medium border ${getBadgeStyle(estadoActual)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle(estadoActual)}`} />
                        <span>{estadoActual}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* VISTA 3: EMPRESAS */}
        {activeTab === 'empresas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {empresasUnicas.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs">
                No hay empresas registradas con los filtros actuales.
              </div>
            ) : (
              empresasUnicas.map((empresa) => (
                <div key={empresa.nombre} className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        {empresa.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{empresa.nombre}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">{empresa.totalContactos} contacto(s) asociado(s)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      Empresa Activa
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Contactos vinculados:</p>
                    <div className="space-y-1.5">
                      {empresa.contactos.map(c => (
                        <div key={c.id} className="bg-slate-900/60 border border-slate-800/60 rounded-lg p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-200">{c.nombre}</span>
                            <span className="text-slate-400 text-[11px] block">{c.email}</span>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getBadgeStyle(c.estado || 'Nuevo')}`}>
                            {c.estado || 'Nuevo'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </main>

      {/* Modal de Detalle / Edición */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d131f] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Detalles del Lead / Proyecto</h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedLead.nombre} ({selectedLead.empresa || 'Particular'})</p>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200 font-mono">{selectedLead.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono:</span>
                  <span className="text-slate-200 font-mono">{selectedLead.telefono || 'No proporcionado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tipo de Proyecto:</span>
                  <span className="text-blue-400 font-mono font-semibold">{selectedLead.tipo_proyecto || 'General'}</span>
                </div>
                {selectedLead.mensaje && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block mb-1">Mensaje del cliente:</span>
                    <p className="text-slate-300 italic bg-slate-950 p-2.5 rounded-lg border border-slate-800">{selectedLead.mensaje}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Asignar Empleado Responsable:</label>
                <select
                  value={empleadoAsignado}
                  onChange={(e) => setEmpleadoAsignado(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Sin asignar --</option>
                  {listaEmpleados.map(nombreEmp => (
                    <option key={nombreEmp} value={nombreEmp}>{nombreEmp}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Presupuesto Estimado ($):</label>
                <input
                  type="number"
                  placeholder="Ej. 1500"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Notas internas de seguimiento:</label>
                <textarea
                  rows={3}
                  placeholder="Escribe detalles de la negociación, llamadas o acuerdos..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/40 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={guardando}
                onClick={handleSaveDetails}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}