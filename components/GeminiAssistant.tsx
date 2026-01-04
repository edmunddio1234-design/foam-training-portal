import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface GeminiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  context: string;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ isOpen, onClose, context }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `You are a training assistant for FOAM (Fathers On A Mission). Help trainees understand the case management process. Use the provided context: ${context}. Be encouraging, professional, and clear. User Question: ${userMessage}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const botText = response.text() || "I'm sorry, I couldn't process that. Can you rephrase?";
      
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
      
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to AI. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeechToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[600px] bg-white shadow-2xl md:rounded-2xl z-[60] flex flex-col border border-slate-200 animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 bg-indigo-600 text-white rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="fas fa-sparkles text-indigo-200"></i>
          <span className="font-bold">FOAM Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors" title="Close Assistant">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 text-sm text-indigo-700">
          Hi! I'm your training sidekick. Ask me anything about the modules, the manual, or FOAM protocols.
        </div>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white shadow-sm border rounded-tl-none text-slate-700'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <button 
            onClick={toggleSpeechToText}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            title="Speech to Text"
          >
            <i className={`fas ${isListening ? 'fa-microphone' : 'fa-microphone-alt'}`}></i>
          </button>
          <input 
            type="text" 
            placeholder={isListening ? "Listening..." : "Type your question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-100 border-none outline-none px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeminiAssistant;
