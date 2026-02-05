
import React from 'react';
import { Linkedin, Twitter, Mail, MapPin } from 'lucide-react';
import { Theme } from '@/types';

interface FooterProps {
  theme: Theme;
}

const Footer: React.FC<FooterProps> = ({ theme }) => {
  const isDark = theme === Theme.DARK;

  return (
    <footer className={`pt-24 pb-12 transition-colors duration-500 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-2">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-black flex items-center">
              <span className="text-green-500 mr-2">ICT</span>
              <span className={isDark ? 'text-white' : 'text-zinc-900'}>Bangladesh</span>
              <span className="text-[#ed1c24] ml-2">AI</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed max-w-sm mb-8">
            Empowering the next generation of IT professionals through real-time intelligent guidance and specialized software solutions.
          </p>
          <div className="flex space-x-6">
            <a href="https://www.linkedin.com/company/ictbangladesh" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="#" className="hover:text-green-500 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="mailto:info@ictbangladesh.com.bd" className="hover:text-green-500 transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Links</h5>
          <ul className="space-y-4 text-sm font-medium">
            <li><a href="https://ictbangladesh.com.bd/" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">Official Website</a></li>
            <li><a href="https://wa.me/8801753060119" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">Course Enrollment</a></li>
            <li><a href="https://ictbangladesh.com.bd/contact" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">Contact Support</a></li>
          </ul>
        </div>

        <div>
          <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Location</h5>
          <div className="flex items-start space-x-3 mb-6">
            <MapPin className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm">ICT Bangladesh HQ<br />Dhaka, Bangladesh</p>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 leading-relaxed">
            Powered by Gemini 3.0<br />Grounding: ictbangladesh.com.bd
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center px-4 max-w-6xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-0">
          © 2026 ICT BANGLADESH. ALL RIGHTS RESERVED.
        </p>
        <div className="flex space-x-8 text-[10px] font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
