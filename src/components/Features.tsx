
import React from 'react';
import { Shield, GraduationCap, Globe } from 'lucide-react';
import { Theme } from '@/types';

interface FeaturesProps {
  theme: Theme;
}

const Features: React.FC<FeaturesProps> = ({ theme }) => {
  const isDark = theme === Theme.DARK;

  const features = [
    {
      icon: Shield,
      title: 'Expert IT Solutions',
      desc: 'Custom software architecture, web applications, and mobile solutions tailored for global scalability.',
    },
    {
      icon: GraduationCap,
      title: 'Professional Training',
      desc: 'Career-focused courses in Web Development, Software Engineering, and Practical IT Skills.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      desc: 'Trusted by clients across 30+ industries in Bangladesh and international markets like the USA.',
    }
  ];

  return (
    <section className="py-12 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto px-4">
      {features.map((f, i) => (
        <div 
          key={i} 
          className={`group p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-700 hover:translate-y-[-8px] ${
            isDark ? 'bg-zinc-950/40 border-white/5 hover:border-[#00a651]/30' : 'bg-white border-zinc-100 hover:shadow-2xl'
          }`}
        >
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-6 md:mb-8 transition-all ${
            isDark ? 'bg-[#00a651]/10 text-[#00a651]' : 'bg-green-50 text-green-600'
          }`}>
            <f.icon className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className={`text-xl md:text-2xl font-black mb-4 md:mb-5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{f.title}</h3>
          <p className={`text-sm md:text-base leading-relaxed font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{f.desc}</p>
        </div>
      ))}
    </section>
  );
};

export default Features;
