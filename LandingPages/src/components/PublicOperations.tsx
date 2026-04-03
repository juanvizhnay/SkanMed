import React from 'react';
import { motion } from 'framer-motion';

interface Operation {
  id: number;
  title: string;
  description: string | null;
  image_url_after: string | null;
  category: string | null;
}

export const PublicOperations = ({ operations }: { operations: Operation[] }) => {
  if (!operations || operations.length === 0) return null;

  return (
    <section className="py-24" id="operaciones">
      <div className="container mx-auto px-6">

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {operations.map((op, index) => (
            <motion.div
              key={op.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-skan-800/40 backdrop-blur rounded-2xl overflow-hidden border border-white/10 hover:border-skan-500/50 hover:shadow-xl hover:shadow-skan-500/10 transition-all duration-300"
            >
              <div className="aspect-video bg-skan-900 overflow-hidden relative border-b border-white/5">
                {op.image_url_after ? (
                  <img
                    src={op.image_url_after}
                    alt={op.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                    Imagen no disponible
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-skan-950/80 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-skan-400">
                  {op.category || 'General'}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-white mb-2 leading-tight">{op.title}</h4>
                <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                  {op.description}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                   <span className="text-xs text-skan-500 font-medium">Ver detalles &rarr;</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
