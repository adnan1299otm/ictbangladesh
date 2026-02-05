
import React, { useState } from 'react';
import { Search, GraduationCap, Palette, Globe, Play, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import { Theme } from '@/types';

interface HeroProps {
  onInitiate: () => void;
  theme: Theme;
  config: { audience: string; topic: string; language: string };
  onConfigChange: (config: any) => void;
}

const Hero: React.FC<HeroProps> = ({ onInitiate, theme, config, onConfigChange }) => {
  const isDark = theme === Theme.DARK;
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const options = {
    audience: ['Student', 'Professional', 'Business Owner', 'International Client'],
    topic: ['Training Courses', 'IT Consultation', 'Software Development', 'Corporate Training'],
    language: ['English', 'Bengali', 'Arabic', 'French']
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const selectOption = (key: string, value: string) => {
    onConfigChange({ ...config, [key]: value });
    setActiveDropdown(null);
  };

  const Dropdown = ({ icon: Icon, label, value, stateKey, items }: any) => (
    <div className={`flex flex-col flex-1 min-w-[120px] relative px-4 lg:px-6 ${stateKey !== 'audience' ? `border-l ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}` : ''}`}>
      <div 
        onClick={() => toggleDropdown(stateKey)}
        className="flex flex-col transition-all cursor-pointer group h-full justify-center py-2"
      >
        <div className="flex items-center space-x-2 mb-1">
          <Icon className={`w-3.5 h-3.5 ${isDark ? 'text-[#00a651]' : 'text-[#00a651]'}`} />
          <span className={`text-[9px] uppercase tracking-widest font-black ${isDark ? 'text-[#00a651]' : 'text-[#00a651]'}`}>{label}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{value}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === stateKey ? 'rotate-180' : ''} text-zinc-400`} />
        </div>
      </div>

      {activeDropdown === stateKey && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
          <div className={`absolute top-full left-0 min-w-[180px] mt-4 p-2 rounded-2xl border z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 backdrop-blur-3xl ${isDark ? 'bg-zinc-900/95 border-white/10' : 'bg-white/95 border-zinc-200'}`}>
            {items.map((item: string) => (
              <div
                key={item}
                onClick={() => selectOption(stateKey, item)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer font-bold mb-1 last:mb-0 ${
                  value === item 
                  ? (isDark ? 'bg-[#00a651]/20 text-[#00ff66]' : 'bg-green-50 text-green-700') 
                  : (isDark ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-50 text-zinc-600')
                }`}
              >
                <span>{item}</span>
                {value === item && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center pt-10 md:pt-20 pb-10 md:pb-20 text-center max-w-6xl mx-auto px-4">
      <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border mb-8 transition-all duration-500 ${isDark ? 'bg-black/50 border-zinc-800' : 'bg-green-50 border-green-100'}`}>
        <ShieldCheck className={`w-3 h-3 ${isDark ? 'text-[#00a651]' : 'text-green-600'}`} />
        <span className={`text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-black ${isDark ? 'text-[#00a651]' : 'text-green-700'}`}>PROFESSIONAL IT TRAINING & SOLUTIONS</span>
      </div>

      <h2 className="text-[40px] md:text-8xl font-black mb-6 md:mb-10 tracking-tighter leading-[1.1] md:leading-[0.95]">
        <span className={`${isDark ? 'text-white' : 'text-zinc-900'}`}>Your Gateway to</span> <br />
        <span className="bg-gradient-to-r from-[#00a651] via-[#00a651] to-[#ed1c24] bg-clip-text text-transparent">ICT Excellence.</span>
      </h2>

      <p className={`text-[13px] md:text-xl mb-10 md:mb-16 max-w-2xl leading-relaxed mx-auto ${isDark ? 'text-zinc-400 font-medium' : 'text-zinc-500 font-medium'}`}>
        Official AI Assistant for ICT Bangladesh. Expert guidance on professional IT courses, software development services, and digital transformation.
      </p>

      {/* Search Card Container */}
      <div className={`w-full max-w-5xl p-1.5 lg:p-2.5 rounded-[2.5rem] lg:rounded-[3rem] border transition-all duration-500 ${
        isDark 
        ? 'bg-[#0a0a0b] border-zinc-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.4)]' 
        : 'bg-white border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)]'
      }`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
          {/* Search Box */}
          <div className={`flex-[1.2] px-6 lg:px-10 py-4 lg:py-6 flex items-center space-x-4 border-b lg:border-b-0 lg:border-r ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
            <Search className={`w-4 h-4 ${isDark ? 'text-[#00a651]' : 'text-zinc-400'}`} />
            <input 
              type="text" 
              placeholder="Ask about ICT Courses..."
              className={`bg-transparent border-none outline-none w-full text-base placeholder:text-zinc-500 font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}
              onKeyDown={(e) => e.key === 'Enter' && onInitiate()}
            />
          </div>
          
          {/* Options Grid */}
          <div className={`flex-[2] flex flex-row items-stretch py-3 border-b lg:border-b-0 lg:border-r ${isDark ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
            <Dropdown icon={GraduationCap} label="AUDIENCE" value={config.audience} stateKey="audience" items={options.audience} />
            <Dropdown icon={Palette} label="FOCUS" value={config.topic} stateKey="topic" items={options.topic} />
            <div className="hidden md:flex flex-1">
              <Dropdown icon={Globe} label="LANGUAGE" value={config.language} stateKey="language" items={options.language} />
            </div>
          </div>

          {/* Action Button */}
          <div className="p-2 lg:p-0 lg:px-4">
            <button 
              onClick={onInitiate}
              className={`w-full lg:w-auto px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 active:scale-95 ${
                isDark 
                ? 'bg-[#00a651] hover:bg-[#00c851] text-white shadow-[0_10px_30px_rgba(0,166,81,0.4)]' 
                : 'bg-[#18181b] hover:bg-black text-white shadow-[0_10px_25px_rgba(0,0,0,0.2)]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>INITIATE</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Attribution Footer */}
      <div className="mt-12 flex items-center justify-center space-x-8 md:space-x-16">
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">ENDORSED BY</span>
          <a href="https://ictbangladesh.com.bd/" target="_blank" rel="noopener noreferrer" className={`text-[11px] font-black ${isDark ? 'text-white' : 'text-zinc-900'}`}>ICT Bangladesh</a>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">DEVELOPER</span>
          <a href="https://www.linkedin.com/in/arafathaladnan" target="_blank" rel="noopener noreferrer" className="text-[11px] font-black text-[#00a651]">Arafath Al Adnan</a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
