
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Theme } from '../types.ts';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onGoHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onGoHome }) => {
  const isDark = theme === Theme.DARK;

  return (
    <header className="py-6 px-4 flex justify-between items-center transition-colors duration-500 relative z-50">
      <div 
        className="flex items-center space-x-3 group cursor-pointer" 
        onClick={onGoHome}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onGoHome()}
      >
        <div className="flex flex-col justify-center">
          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none flex items-center">
            <span className="text-[#00a651]">ICT</span>
            <span className={`ml-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Bangladesh</span>
            <span className="text-[#ed1c24] ml-1.5">AI</span>
          </h1>
          <p className={`text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5 transition-opacity duration-300 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            OFFICIAL ASSISTANT
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className={`px-3 py-1.5 rounded-full border hidden md:flex items-center space-x-2 transition-colors duration-500 ${isDark ? 'bg-black/20 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
          <div className="w-2 h-2 rounded-full bg-[#00a651] shadow-[0_0_10px_rgba(0,166,81,0.8)] animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-[#00a651]">SYSTEM LIVE</span>
        </div>
        
        <button 
          onClick={onToggleTheme}
          className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl border transition-all duration-300 ${isDark ? 'bg-zinc-900/50 hover:bg-zinc-800 border-zinc-800' : 'bg-white hover:bg-zinc-100 border-zinc-200 shadow-sm'}`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-500/80" /> : <Moon className="w-5 h-5 text-zinc-700" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
