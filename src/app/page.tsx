'use client';

import { useState } from 'react';
import Logo from './components/ui/Logo';
import { Monitor, Smartphone, Code2, Send, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    tipo_proyecto: 'Página Web',
    mensaje: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEnviado(true);
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEnviado(false);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      tipo_proyecto: 'Página Web',
      mensaje: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Fondo decorativo con luces de neón difuminadas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Header flotante con efecto cristal */}
      <header className="border-b border-slate-800/60 bg-[#05070a]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto">
        <Logo />
        
        {!enviado && (
          <button
            onClick={() => {
              const element = document.getElementById('contacto');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 border border-blue-400/20 cursor-pointer"
          >
            Pedir Presupuesto
          </button>
        )}
      </header>

      {/* Hero Section más moderna y creativa */}
      <section className="px-6 pt-28 pb-16 text-center max-w-5xl mx-auto space-y-8 relative">
        
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Innovación & Desarrollo a Medida</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
          Transformamos ideas en <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Software Escalable
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
          Diseñamos y desarrollamos páginas web corporativas, aplicaciones web y soluciones móviles con un rendimiento excepcional.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => {
              document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-xl shadow-blue-600/20 transition-all cursor-pointer"
          >
            Comenzar Proyecto
          </button>
        </div>
      </section>

      {/* Tarjetas de Servicios con efecto de brillo en borde */}
      <section className="px-6 py-12 max-w-6xl mx-auto w-full grid md:grid-cols-3 gap-6">
        <div className="group p-8 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl space-y-4 transition-all duration-300 shadow-xl">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Monitor className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Páginas Web</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Sitios corporativos modernos, rápidos y optimizados para buscadores.</p>
        </div>

        <div className="group p-8 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl space-y-4 transition-all duration-300 shadow-xl">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Code2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Aplicaciones Web</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Paneles de administración avanzados y plataformas SaaS escalables.</p>
        </div>

        <div className="group p-8 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/50 rounded-2xl space-y-4 transition-all duration-300 shadow-xl">
          <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">Apps Móviles</h3>
          <p className="text-slate-400 text-sm leading-relaxed">Aplicaciones nativas e híbridas de alto rendimiento para iOS y Android.</p>
        </div>
      </section>

      {/* Sección del Formulario */}
      <section id="contacto" className="px-6 py-20 max-w-3xl mx-auto w-full">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          {!enviado && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Cuéntanos sobre tu proyecto</h2>
              <p className="text-slate-400 text-sm">Completa el formulario para enviarnos tu propuesta directamente al CRM.</p>
            </div>
          )}

          {enviado ? (
            <div className="text-center py-12 space-y-6">
              <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white">¡Solicitud Recibida!</h3>
                <p className="text-slate-400 text-sm">Hemos registrado tu propuesta en nuestro CRM de forma exitosa.</p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-sm font-semibold transition-all border border-slate-700 shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Enviar otro mensaje</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ej. Juan Pérez"
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="juan@empresa.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="+34 600 000 000"
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Empresa</label>
                  <input
                    type="text"
                    value={formData.empresa}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Nombre de la empresa"
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tipo de Proyecto</label>
                <select
                  value={formData.tipo_proyecto}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-300"
                  onChange={(e) => setFormData({ ...formData, tipo_proyecto: e.target.value })}
                >
                  <option value="Página Web">Página Web Corporativa</option>
                  <option value="Aplicación Web">Aplicación Web / Dashboard</option>
                  <option value="App Móvil">App Móvil (iOS / Android)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Detalles del Proyecto *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.mensaje}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Describe tu idea..."
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/25 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}