
import React, { useState, useEffect, useCallback } from 'react';
import { Theme, ChatSession, Message } from './types.ts';
import Header from './components/Header.tsx';
import Hero from './components/Hero.tsx';
import Features from './components/Features.tsx';
import Stats from './components/Stats.tsx';
import Footer from './components/Footer.tsx';
import ChatInterface from './components/ChatInterface.tsx';
import FluidBackground from './components/FluidBackground.tsx';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [isChatActive, setIsChatActive] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [chatConfig, setChatConfig] = useState({
    audience: 'Student',
    topic: 'Training Course',
    language: 'English'
  });

  useEffect(() => {
    const savedSessions = localStorage.getItem('ict_bd_chat_sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        const revived = parsed.map((s: any) => ({
          ...s,
          lastUpdated: new Date(s.lastUpdated),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSessions(revived);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ict_bd_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (theme === Theme.LIGHT) {
      document.body.classList.add('light', 'bg-zinc-50', 'text-zinc-900');
      document.body.classList.remove('dark', 'bg-black', 'text-white');
    } else {
      document.body.classList.remove('light', 'bg-zinc-50', 'text-zinc-900');
      document.body.classList.add('dark', 'bg-black', 'text-white');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: `chat_${Date.now()}`,
      title: 'নতুন আলোচনা (New Chat)',
      messages: [],
      lastUpdated: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsChatActive(true);
  }, []);

  const startChat = () => {
    if (sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
      setIsChatActive(true);
    } else {
      createNewSession();
    }
  };

  const goHome = () => {
    setIsChatActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        let title = s.title;
        // Intelligently generate a descriptive title from the first user message
        if (title.includes('New Chat') || title.includes('নতুন আলোচনা') || !title) {
          const firstUserMsg = messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            const text = firstUserMsg.content.trim();
            // Clean title: remove common fillers and cap length
            let derived = text.length > 40 ? text.substring(0, 37).trim() + '...' : text;
            if (derived.toLowerCase() === 'analyze this image.') derived = 'চিত্র বিশ্লেষণ (Image Analysis)';
            title = derived;
          }
        }
        return { ...s, messages, lastUpdated: new Date(), title };
      }
      return s;
    }));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].id);
      } else {
        setIsChatActive(false);
        setCurrentSessionId(null);
      }
    }
  };

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${theme === Theme.DARK ? 'dot-grid' : 'dot-grid'}`}>
      <FluidBackground theme={theme} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-opacity duration-500">
        <Header theme={theme} onToggleTheme={toggleTheme} onGoHome={goHome} />
        
        <main className="transition-all duration-700 ease-out relative z-20">
          {!isChatActive ? (
            <div className="animate-in fade-in duration-1000">
              <Hero 
                onInitiate={startChat} 
                theme={theme} 
                config={chatConfig} 
                onConfigChange={setChatConfig} 
              />
              <Features theme={theme} />
              <Stats theme={theme} />
              <Footer theme={theme} />
            </div>
          ) : (
            <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ChatInterface 
                theme={theme} 
                sessions={sessions}
                currentSessionId={currentSessionId}
                config={chatConfig}
                onSelectSession={setCurrentSessionId}
                onNewChat={createNewSession}
                onDeleteSession={deleteSession}
                onUpdateMessages={updateSessionMessages}
              />
            </div>
          )}
        </main>
      </div>

      <div className={`fixed top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full -z-10 transition-colors duration-1000 ${theme === Theme.DARK ? 'bg-green-600/5' : 'bg-green-600/10'}`} />
      <div className={`fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full -z-10 transition-colors duration-1000 ${theme === Theme.DARK ? 'bg-red-600/5' : 'bg-blue-600/5'}`} />
    </div>
  );
};

export default App;
