import React from 'react';
import { MapPin, Phone, Mail, Clock, Linkedin } from 'lucide-react';

interface ContactProps {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  mapUrl?: string | null;
  linkedin?: string | null;
  scheduleWeekdays?: string | null;
  scheduleSaturday?: string | null;
  scheduleSunday?: string | null;
}

function cleanPhone(num: string | null | undefined): string {
  if (!num) return '';
  return num.replace(/[^0-9]/g, '');
}

export const Contact = ({ address, phone, email, mapUrl, linkedin, scheduleWeekdays, scheduleSaturday, scheduleSunday }: ContactProps) => {
  const waNumber = cleanPhone(phone);
  const waMessage = encodeURIComponent('Buenos días doctor, me gustaría agendar una cita.');
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : '';

  return (
    <section className="py-24 bg-skan-900 relative" id="contacto">
      <div className="container mx-auto px-6">
        
        <div className="grid lg:grid-cols-2 gap-12 bg-skan-800/50 backdrop-blur-sm rounded-3xl p-2 border border-white/5 overflow-hidden">
          
          <div className="p-8 md:p-12">
            <h2 className="text-sm font-bold text-skan-400 uppercase tracking-wider mb-2">Contacto Directo</h2>
            <h3 className="text-3xl font-display font-bold text-white mb-8">Agende su Consulta</h3>
            
            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="w-12 h-12 bg-skan-950 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-skan-500/50 transition-colors">
                  <MapPin className="text-skan-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Consultorio Principal</h4>
                  <p className="text-slate-400 text-sm max-w-xs">{address || "Dirección no disponible"}</p>
                </div>
              </div>

              {phone && waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex gap-6 group cursor-pointer">
                  <div className="w-12 h-12 bg-skan-950 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-green-500/50 transition-colors">
                    <Phone className="text-skan-400 group-hover:text-green-400 transition-colors" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors">Teléfono & WhatsApp</h4>
                    <p className="text-slate-400 text-sm">{phone}</p>
                  </div>
                </a>
              )}

              {!phone && (
                <div className="flex gap-6 group">
                  <div className="w-12 h-12 bg-skan-950 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="text-skan-400" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Teléfono & WhatsApp</h4>
                    <p className="text-slate-400 text-sm">No registrado</p>
                  </div>
                </div>
              )}

              <div className="flex gap-6 group">
                <div className="w-12 h-12 bg-skan-950 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-skan-500/50 transition-colors">
                  <Mail className="text-skan-400" size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Correo Electrónico</h4>
                  {email ? (
                    <a href={`mailto:${email}`} className="text-slate-400 text-sm hover:text-skan-400 transition-colors">{email}</a>
                  ) : (
                    <p className="text-slate-400 text-sm">No registrado</p>
                  )}
                </div>
              </div>

              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="flex gap-6 group cursor-pointer">
                  <div className="w-12 h-12 bg-skan-950 border border-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:border-blue-500/50 transition-colors">
                    <Linkedin className="text-skan-400 group-hover:text-blue-400 transition-colors" size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">LinkedIn</h4>
                    <p className="text-slate-400 text-sm">Ver perfil profesional</p>
                  </div>
                </a>
              )}
            </div>

            <div className="mt-12 p-6 bg-skan-950/50 rounded-2xl border border-white/5">
              <div className="flex items-start gap-4">
                <Clock className="text-skan-500 mt-1" size={20} />
                <div>
                  <h5 className="font-bold text-white text-sm">Horarios de Atención</h5>
                  <p className="text-slate-400 text-xs mt-1">Lunes a Viernes: {scheduleWeekdays || 'No especificado'}</p>
                  {scheduleSaturday && <p className="text-slate-400 text-xs">Sábados: {scheduleSaturday}</p>}
                  {scheduleSunday && <p className="text-slate-400 text-xs">Domingos: {scheduleSunday}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[400px] lg:h-auto rounded-2xl overflow-hidden bg-skan-950">
            {mapUrl ? (
              <iframe 
                src={mapUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80 hover:opacity-100 transition-opacity"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                <MapPin size={48} className="opacity-20" />
              </div>
            )}
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-skan-950 via-transparent to-transparent opacity-50"></div>
          </div>

        </div>
      </div>
    </section>
  );
};
