import { useState, useRef, useEffect } from 'react';
import { askAstrophel } from '../services/astraService';
import { Send, Bot, User, X, Minimize2, Maximize2, Satellite } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "Best site for Mars rover testing?",
  "Where to train for lunar EVA?",
  "Which location has the most Mars-like minerals?",
  "Top 3 sites for geological sampling?",
];

export default function ASTRAChat({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: 'Astrophel online. I am your mission analog planning assistant from Team Astrophel. Describe your mission objective and I will identify the most suitable Earth training environments.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getHistory = () =>
    messages.slice(1).map((m) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const reply = await askAstrophel(text, getHistory());
    setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-6 z-[200] w-[420px] flex flex-col bg-black/70 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_0_60px_rgba(56,189,248,0.15)] overflow-hidden"
      style={{ maxHeight: minimized ? 'auto' : '580px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-nasa-blue/30 to-transparent shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-nasa-light/20 border border-nasa-light/50 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <Satellite size={18} className="text-nasa-light" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-black animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide">Astrophel</div>
            <div className="text-[10px] text-nasa-light uppercase tracking-widest">Mission Planning AI</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimized((v) => !v)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-nasa-red transition-colors rounded-lg hover:bg-nasa-red/10"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === 'model'
                    ? 'bg-nasa-light/20 border border-nasa-light/40 shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                    : 'bg-white/10 border border-white/20'
                }`}>
                  {msg.role === 'model'
                    ? <Bot size={14} className="text-nasa-light" />
                    : <User size={14} className="text-white" />
                  }
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed font-medium ${
                  msg.role === 'model'
                    ? 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                    : 'bg-nasa-light/20 border border-nasa-light/30 text-white rounded-tr-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-nasa-light/20 border border-nasa-light/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                  <Bot size={14} className="text-nasa-light" />
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-nasa-light animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-nasa-light animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-nasa-light animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] px-3 py-1.5 rounded-full border border-nasa-light/30 text-nasa-light bg-nasa-light/10 hover:bg-nasa-light/20 transition-colors font-bold tracking-wide"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-nasa-light/50 transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Describe your mission..."
                className="flex-1 bg-transparent text-xs text-white placeholder:text-gray-500 outline-none font-medium"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-8 h-8 rounded-full bg-nasa-light flex items-center justify-center text-space-950 hover:bg-blue-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-[9px] text-gray-600 text-center mt-2 uppercase tracking-widest">
              Astrophel AI — Powered by Google Gemini — Free
            </p>
          </div>
        </>
      )}
    </motion.div>
  );
}
