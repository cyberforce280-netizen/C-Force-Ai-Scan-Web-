import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Sparkles, User, Terminal } from 'lucide-react';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hello, Commander. C-Force AI Analyst online. I am ready to analyze threats and correlate data. Awaiting instructions.',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API (exclude IDs/timestamps)
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const responseText = await sendChatMessage(userMsg.content, history);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-red-700 hover:bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-white/10 transition-all hover:scale-105 z-50 group"
      >
        <Bot size={24} className="group-hover:animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-black border border-red-900/40 rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden flex animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-neutral-900 p-4 border-b border-red-900/30 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-900/30 border border-red-900/50 rounded-lg">
             <Bot size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm font-orbitron">AI ANALYST</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-red-400 uppercase tracking-wide">Connected</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/95">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === 'user' ? 'bg-neutral-800 border-neutral-700' : 'bg-red-900/20 border-red-900/50'}`}>
              {msg.role === 'user' ? <User size={14} className="text-neutral-300"/> : <Terminal size={14} className="text-red-500"/>}
            </div>
            <div className={`p-3 rounded-sm text-sm max-w-[85%] font-mono ${
              msg.role === 'user' 
                ? 'bg-neutral-800 text-white border border-neutral-700' 
                : 'bg-red-950/10 border border-red-900/30 text-neutral-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-red-900/20 flex items-center justify-center flex-shrink-0 border border-red-900/50">
               <Sparkles size={14} className="text-red-500"/>
             </div>
             <div className="p-3 rounded-sm bg-red-950/10 border border-red-900/30 text-red-400 text-xs flex items-center gap-2">
               <span className="animate-bounce">●</span>
               <span className="animate-bounce delay-100">●</span>
               <span className="animate-bounce delay-200">●</span>
               PROCESSING...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-neutral-900 border-t border-red-900/30">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query AI Intelligence..."
            className="w-full bg-black border border-neutral-700 text-white pl-4 pr-12 py-3 rounded-sm text-sm focus:outline-none focus:border-red-600 transition-colors font-mono placeholder:text-neutral-700"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-red-700 hover:bg-red-600 text-white rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-[10px] text-neutral-600 mt-2 text-center">
          C-Force AI generated content. Verify critical data.
        </div>
      </div>
    </div>
  );
};