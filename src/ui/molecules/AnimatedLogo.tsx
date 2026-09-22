import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers } from 'lucide-react';
import { cn } from '../utils/cn';

interface AnimatedLogoProps {
  readonly onClick?: () => void;
  readonly className?: string;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onClick, className }) => {
  return (
    <motion.div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      title="TabZenith — Ir al Centro de Mando"
      className={cn(
        'group flex items-center gap-3 select-none transition-all outline-none',
        onClick ? 'cursor-pointer' : '',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icono animado cósmico con capas y halo orbital */}
      <div className="relative w-9 h-9 flex items-center justify-center">
        {/* Halo resplandeciente exterior */}
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-brand-primary via-purple-500 to-cyan-400 opacity-60 blur-sm group-hover:opacity-100 transition-opacity"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Contenedor central del icono */}
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-surface-card via-surface-elevated to-surface-card border border-brand-border/80 flex items-center justify-center overflow-hidden shadow-md">
          {/* Capas flotantes animadas */}
          <motion.div
            animate={{
              y: [0, -2, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative flex items-center justify-center text-brand-primary"
          >
            <Layers className="w-5 h-5 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          </motion.div>

          {/* Destello estelar en esquina */}
          <motion.div
            className="absolute top-1 right-1 text-cyan-300"
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="w-2.5 h-2.5" />
          </motion.div>
        </div>
      </div>

      {/* Tipografía con gradiente holográfico y badge ejecutivo */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent group-hover:from-indigo-200 group-hover:to-cyan-200 transition-all">
            TabZenith
          </span>
          <span className="relative flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-primary/20 border border-brand-primary/40 text-[9px] font-black uppercase tracking-widest text-brand-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI OS</span>
          </span>
        </div>
        <span className="text-[10px] font-medium text-content-muted tracking-wide -mt-0.5 hidden sm:block">
          Executive Tab Engine
        </span>
      </div>
    </motion.div>
  );
};
