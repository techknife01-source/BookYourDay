import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'rose' | 'slate' | 'emerald' | 'amber' | 'indigo' | 'cyan' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'rose',
  size = 'sm',
  className = ''
}) => {
  const variantStyles = {
    rose: 'bg-rose-600/20 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-600/20 text-amber-400 border-amber-500/30',
    indigo: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30',
    cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
    outline: 'bg-transparent text-slate-300 border-slate-700'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-bold uppercase transition-all whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
