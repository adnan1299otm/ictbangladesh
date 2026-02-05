
import React from 'react';
import { Theme } from '../types.ts';

interface StatsProps {
  theme: Theme;
}

const Stats: React.FC<StatsProps> = ({ theme }) => {
  const isDark = theme === Theme.DARK;

  const stats = [
    { value: '2018', label: 'FOUNDED' },
    { value: '30+', label: 'INDUSTRIES' },
    { value: 'Global', label: 'EXPERTISE' },
    { value: '24/7', label: 'SUPPORT' }
  ];

  return (
    <section className="py-12 md:py-20 px-4">
      <div className={`max-w-5xl mx-auto rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 border grid grid-cols-2 md:flex md:flex-row justify-between items-center gap-8 relative overflow-hidden transition-all duration-700 ${
        isDark ? 'bg-zinc-950/80 border-white/5 shadow-2xl' : 'bg-zinc-50 border-zinc-200 shadow-lg'
      }`}>
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-green-500/5 blur-[80px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
        
        {stats.map((s, i) => (
          <div key={i} className="text-center group">
            <h4 className={`text-3xl md:text-5xl font-black mb-1 md:mb-2 transition-transform duration-500 group-hover:scale-110 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{s.value}</h4>
            <p className={`text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
