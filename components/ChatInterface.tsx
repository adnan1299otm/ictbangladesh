
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Plus, History, Trash2, ChevronLeft, ChevronRight, Volume2, Mic, Image as ImageIcon, X, ShieldCheck, Zap } from 'lucide-react';
import { Message, Theme, ChatSession } from '../types.ts';
import { generateAIResponse, transcribeAudio, generateSpeech } from '../services/geminiService.ts';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const renderContent = (content: string, isDark: boolean, isUser: boolean) => {
  const lines = content.split('\n');
  return lines.map((line, lineIndex) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const processedLine = parts.map((part, partIndex) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        let boldColor = isUser ? 'text-white' : (isDark ? 'text-[#00ff66]' : 'text-green-600');
        return (
          <strong key={`${lineIndex}-${partIndex}`} className={`font-black tracking-tight ${boldColor}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const dotColor = isUser ? 'bg-white' : (isDark ? 'bg-[#00ff66]' : 'bg-green-600');
      return (
        <div key={lineIndex} className="flex items-start space-x-2 ml-1 my-1">
          <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${dotColor}`} />
          <p className={`flex-1 leading-relaxed ${isUser ? 'text-white' : (isDark ? 'text-white' : 'text-zinc-900')}`}>
            {processedLine.map(p => (typeof p === 'string' ? p.replace(/^[-*]\s/, '') : p))}
          </p>
        </div>
      );
    }

    return (
      <p key={lineIndex} className={`${line.trim() === '' ? 'h-2' : 'mb-2'} leading-relaxed ${isUser ? 'text-white font-semibold' : (isDark ? 'text-white font-medium' : 'text-zinc-900 font-medium')}`}>
        {processedLine}
      </p>
    );
  });
};

interface ChatInterfaceProps {
  theme: Theme;
  sessions: ChatSession[];
  currentSessionId: string | null;
  config: { audience: string; topic: string; language: string };
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onUpdateMessages: (id: string, messages: Message[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  theme, sessions, currentSessionId, config, onSelectSession, onNewChat, onDeleteSession, onUpdateMessages
}) => {
  const isDark = theme === Theme.DARK;
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const systemInstruction = `
You are the official AI Assistant for ICT Bangladesh. Your role is to provide accurate, helpful information about ICT Bangladesh services, programs, and initiatives in a professional yet friendly manner.

Core Identity
- Name: ICT Bangladesh AI Assistant
- Purpose: Help users with ICT Bangladesh information
- Knowledge Source: Google Search (Fetch real-time info from https://ictbangladesh.com.bd/)
- Language: **DEFAULT TO ENGLISH**. Only speak Bangla if the user explicitly speaks Bangla.

Communication Style
- Professional but friendly (Helpful tone)
- SHORT and CONCISE responses (2-4 sentences typically)
- Clear and direct answers
- Warm and approachable
- Use simple language, avoid jargon
- **COLORFUL FORMATTING**: You MUST use **double asterisks** around Course Names, Fees, Phone Numbers, and Key Integers. (e.g., **Certified AI Professional**, **+880 1753-060119**). This makes them appear in COLOR.

Response Guidelines
- **Use Google Search**: Always use the Google Search tool to find relevant ICT Bangladesh information (courses, fees, location).
- **DIRECT ANSWERS**: Provide clear, concise answers using the retrieved information. NEVER tell the user to visit the website. Fetch the data and show it.
- **NO REDIRECTION**: If asked about courses/fees, list them. Do NOT say "Check the website".
- **Visuals**: Always BOLD the course titles and phone numbers.

When Information is NOT Available
- Bangla: "দুঃখিত, এই বিষয়ে আমার কাছে সুনির্দিষ্ট তথ্য নেই। আরও জানতে আপনি আমাদের হটলাইনে যোগাযোগ করতে পারেন: **+880 1753-060119**"
- English: "I don't have specific information on this. For more details, please contact our hotline: **+880 1753-060119**"

Enrollment Queries
- Bangla: "এনরোল করতে চাইলে আপনি সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন:\n📞 **+880 1753-060119**\nআমি কি **কোর্স** বা **প্রোগ্রাম** সম্পর্কে আরও তথ্য দিতে পারি?"
- English: "To enroll, please contact us directly at:\n📞 **+880 1753-060119**\nCan I provide more information about our **courses** or **programs**?"

Important Rules
DO:
✓ Answer from search results only
✓ Keep responses short and professional (2-4 sentences)
✓ USE **BOLD** FOR ALL KEY TERMS to make them colorful
✓ Respond in user's language
✓ Be helpful and solution-oriented

DON'T:
✗ Make up information
✗ Give long, wordy explanations
✗ Discuss unrelated topics
✗ Provide wrong or outdated contact information

DEVELOPER INFO (Only if asked):
- Developed by **Arafath Al Adnan** (Student of ICT Bangladesh).
- LinkedIn: https://www.linkedin.com/in/arafathaladnan/
- Must Add: "আপনি যদি আমার মতো উন্নত এআই (AI) তৈরি করতে চান, তাহলে আইসিটি বাংলাদেশ (ICT Bangladesh) এর প্রফেশনাল কোর্সে ভর্তি হতে পারেন, যেখান থেকে আরাফাত এই দক্ষতা অর্জন করেছেন।"

Contact: +880 1753-060119
`;

  useEffect(() => {
    if (currentSessionId && messages.length === 0 && !isLoading) {
      const welcome = "Welcome! 👋 I'm the ICT Bangladesh AI Assistant. I can help you with information about our ICT services, programs, and courses. How may I assist you today?";
      onUpdateMessages(currentSessionId, [{ id: 'welcome', role: 'assistant', content: welcome, timestamp: new Date() }]);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isTranscribing]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading || !currentSessionId) return;
    const userQuery = input.trim() || "Analyze this image.";
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userQuery, timestamp: new Date(), imageUrl: selectedImage || undefined };
    const updatedMessages = [...messages, userMessage];
    onUpdateMessages(currentSessionId, updatedMessages);
    const base64Image = selectedImage?.split(',')[1];
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
    try {
      const history = updatedMessages.slice(-8).map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
      const aiResult = await generateAIResponse(userQuery, history, systemInstruction, base64Image ? { data: base64Image, mimeType: imageMimeType } : undefined);
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: aiResult.text, timestamp: new Date(), sources: aiResult.sources };
      console.log("Raw AI Response:", aiResult.text); // Debugging
      onUpdateMessages(currentSessionId, [...updatedMessages, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "Something went wrong"));
      // Add a visual error message to chat if needed
      onUpdateMessages(currentSessionId, [...updatedMessages, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "⚠️ Error detected: " + (err.message || "Check console for details."),
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const transcript = await transcribeAudio(base64, 'audio/webm');
          if (transcript) setInput(prev => (prev.trim() + ' ' + transcript).trim());
          setIsTranscribing(false);
        };
      };
      recorder.start();
      setIsRecording(true);
    } catch { }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
  };

  return (
    <div className={`flex h-[88vh] md:h-[78vh] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden border transition-all duration-500 relative ${isDark ? 'bg-[#0a0a0a] border-zinc-900 shadow-2xl' : 'bg-white border-zinc-200 shadow-xl'}`}>

      <div className={`absolute lg:relative inset-y-0 left-0 z-50 transition-all duration-500 border-r overflow-hidden flex flex-col ${isSidebarOpen ? 'w-[280px] translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0'} ${isDark ? 'border-white/5 bg-[#0a0a0a]' : 'border-zinc-200 bg-zinc-50'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#00a651]" />
            <span className="text-[10px] font-black tracking-widest uppercase">HISTORY</span>
          </div>
          <button onClick={onNewChat} className="p-1 text-[#00a651] hover:scale-110 transition-transform"><Plus className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => { onSelectSession(s.id); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}
              className={`p-4 rounded-xl border transition-all group cursor-pointer ${currentSessionId === s.id ? (isDark ? 'bg-[#00a651]/10 border-[#00a651]' : 'bg-green-50 border-green-500 shadow-sm') : 'border-transparent hover:bg-white/5'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-black block truncate uppercase text-zinc-200 leading-tight">{s.title || 'New Discussion'}</span>
                  <span className="text-[9px] font-bold opacity-30 uppercase block mt-1">
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(s.lastUpdated)}
                  </span>
                </div>
                {currentSessionId !== s.id && (
                  <button onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-500 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col relative min-w-0">
        <div className="flex items-center p-3 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:left-0 lg:-translate-x-1/2 lg:z-30">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-xl border shadow-xl transition-all ${isDark ? 'bg-zinc-900 border-white/10 text-zinc-400 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-600'}`}>
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div ref={scrollRef} className={`flex-1 overflow-y-auto p-4 lg:p-12 space-y-10 scroll-smooth ${isDark ? 'bg-[#050505]' : 'bg-zinc-50'}`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`flex max-w-[95%] lg:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
                <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg transform transition-all hover:scale-105 ${msg.role === 'user'
                  ? 'bg-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.3)]'
                  : (isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-200')
                  }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-black" /> : <Bot className={`w-5 h-5 ${isDark ? 'text-[#00ff66]' : 'text-[#00a651]'}`} />}
                </div>
                <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-6 py-5 rounded-3xl relative border transition-all shadow-xl ${msg.role === 'user'
                    ? (isDark ? 'bg-gradient-to-br from-[#004d2a] to-[#002b16] border-[#00a651]/30 text-white' : 'bg-gradient-to-br from-green-100 to-green-50 border-green-200 text-green-900') + ' rounded-tr-none'
                    : (isDark ? 'bg-[#111] border-white/5 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-sm') + ' rounded-tl-none'
                    }`}>
                    {msg.imageUrl && (
                      <div className="rounded-xl overflow-hidden mb-4 border border-white/10 shadow-2xl max-w-full">
                        <img src={msg.imageUrl} className="w-full h-auto object-contain max-h-[400px]" alt="user input" />
                      </div>
                    )}
                    <div className="text-[14px] lg:text-[15px] leading-relaxed">
                      {renderContent(msg.content, isDark, msg.role === 'user')}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{formatTime(msg.timestamp)}</span>
                      {msg.role === 'assistant' && (
                        <button onClick={async () => {
                          const audio = await generateSpeech(msg.content);
                          if (!audio) return;
                          if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                          const ctx = audioContextRef.current;
                          const buffer = await decodeAudioData(decode(audio), ctx, 24000, 1);
                          const source = ctx.createBufferSource();
                          source.buffer = buffer;
                          source.connect(ctx.destination);
                          source.start(0);
                        }} className={`p-1 transition-all text-zinc-600 hover:text-[#00ff66]`}>
                          <Volume2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`flex items-center space-x-3 px-6 py-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <Loader2 className="w-4 h-4 animate-spin text-[#00ff66]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Processing...</span>
              </div>
            </div>
          )}
        </div>

        <div className={`p-6 lg:p-10 border-t ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-zinc-200'}`}>
          {selectedImage && (
            <div className="mb-4 relative inline-block group animate-in zoom-in-95">
              <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-[#00ff66] shadow-2xl relative">
                <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg border-2 border-black">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className={`flex items-center gap-2 p-2.5 lg:p-4 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-black/50 border-zinc-800 focus-within:border-[#00a651] focus-within:bg-black' : 'bg-zinc-50 border-zinc-200 focus-within:bg-white focus-within:border-[#00a651] shadow-sm'}`}>
            <div className="flex items-center space-x-1 lg:space-x-2 mr-1">
              <button
                onMouseDown={startRecording} onMouseUp={() => mediaRecorderRef.current?.stop()}
                className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'text-zinc-500 hover:text-[#00ff66] hover:bg-white/5'}`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl text-zinc-500 hover:text-[#00ff66] hover:bg-white/5 transition-all">
                <ImageIcon className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => { setSelectedImage(reader.result as string); setImageMimeType(file.type); };
                  reader.readAsDataURL(file);
                }
              }} accept="image/*" className="hidden" />
            </div>

            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query ICT Bangladesh..."
              className={`flex-1 bg-transparent px-2 py-2 text-[14px] lg:text-[15px] border-none outline-none font-bold placeholder:text-zinc-800 ${isDark ? 'text-white' : 'text-zinc-900'}`}
            />

            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className={`w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0 flex items-center justify-center rounded-2xl transition-all ${isLoading || (!input.trim() && !selectedImage) ? 'bg-zinc-900 text-zinc-800 opacity-40 cursor-not-allowed' : 'bg-[#00a651] text-white shadow-[0_4px_15px_rgba(0,166,81,0.3)] hover:bg-[#00c851] active:scale-95'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between items-center mt-6 px-2">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-zinc-600 opacity-60">
                <Zap className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">GEMINI 1.5 FLASH (v2.5)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-zinc-700 opacity-60">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">SECURE</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
