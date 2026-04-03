import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  fullName: string;
  specialty: string;
  description?: string | null;
  image?: string | null;
  whatsapp?: string | null;
  statYearsExp?: string | null;
  statPatients?: string | null;
  statSuccess?: string | null;
}

export const Hero = ({ fullName, specialty, description, image, whatsapp, statYearsExp, statPatients, statSuccess }: HeroProps) => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">

      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-skan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-skan-500/10 border border-skan-500/20 rounded-full text-skan-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-skan-500 rounded-full animate-pulse" />
            Neurocirugía de Vanguardia
          </div>

          <div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-4">
              {fullName}
            </h1>
            <h2 className="text-2xl md:text-3xl text-skan-400 font-medium">
              {specialty}
            </h2>
          </div>

          <p className="text-lg text-slate-400 max-w-lg leading-relaxed border-l-2 border-skan-500/30 pl-6">
            {description || "Dedicado a mejorar la calidad de vida de mis pacientes a través de procedimientos quirúrgicos de vanguardia."}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-gradient-to-r from-skan-500 to-blue-600 hover:from-skan-400 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-skan-500/20 transition-all flex items-center gap-2"
              >
                <Phone size={20} />
                Agendar Cita
              </a>
            )}
            <a href="#contacto" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center gap-2">
              <MapPin size={20} />
              Ver Ubicación
            </a>
          </div>

          <div className="pt-8 flex gap-8 border-t border-white/5">
            <div>
              <p className="text-3xl font-bold text-white">{statYearsExp || '+10'}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Anos Exp.</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{statPatients || '500+'}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Pacientes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{statSuccess || '98%'}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Exito</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center"
        >
          {/* Decorative Ring */}
          <div className="absolute inset-0 border border-white/10 rounded-full scale-110 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-0 border border-dashed border-white/5 rounded-full scale-125 animate-[spin_30s_linear_infinite_reverse]" />

          {/* Doctor Image */}
          <div className="relative w-full h-full max-h-[550px] rounded-3xl overflow-hidden bg-skan-900 border border-white/10 shadow-2xl">
            {image ? (
              <img
                src={image}
                alt={fullName}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <Activity size={48} className="mb-4 text-skan-900" />
                <span>Imagen no disponible</span>
              </div>
            )}

            {/* Glass Card Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-skan-950/80 backdrop-blur-md p-6 border-t border-white/10">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                   <CheckCircle2 size={20} />
                 </div>
                 <p className="text-sm font-medium text-slate-300">Certificado por el Colegio Médico</p>
               </div>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
