import { useEffect, useRef, useState } from 'react';
import { apiPost } from '../api/client';

interface Message {
  role: 'user' | 'ai';
  text: string;
  typing?: boolean;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stop = () => {
    stoppedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTyping(false);
    setLoading(false);
    // Mark last AI message as no longer typing
    setMessages(prev => {
      const next = [...prev];
      if (next.length > 0 && next[next.length - 1].role === 'ai') {
        next[next.length - 1] = { ...next[next.length - 1], typing: false };
      }
      return next;
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || typing) return;

    stoppedRef.current = false;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    setMessages(prev => [...prev, { role: 'ai', text: '', typing: true }]);

    try {
      const data = await apiPost<{ reply: string }>('/api/chat', { message: text });

      if (stoppedRef.current) return;

      const reply = data.reply;
      setLoading(false);
      setTyping(true);

      let i = 0;
      intervalRef.current = setInterval(() => {
        if (stoppedRef.current) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return;
        }
        i++;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'ai',
            text: reply.slice(0, i),
            typing: i < reply.length,
          };
          return next;
        });
        if (i >= reply.length) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setTyping(false);
        }
      }, 18);
    } catch {
      if (stoppedRef.current) return;
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'ai', text: 'Sorry, something went wrong. Try again.' };
        return next;
      });
    } finally {
      if (!stoppedRef.current) setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isBusy = loading || typing;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-navy text-white shadow-lg flex items-center justify-center text-2xl hover:bg-navy/90 transition-colors"
        aria-label="Open AI chat"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-3xl shadow-2xl bg-white border border-stone-200 flex flex-col overflow-hidden"
             style={{ maxHeight: '520px' }}>

          {/* Header */}
          <div className="bg-navy px-5 py-4 flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">English Assistant</p>
              <p className="text-white/60 text-xs">Ask me anything about English</p>
            </div>
            {isBusy && (
              <button
                onClick={stop}
                className="text-xs font-bold text-white/80 hover:text-white border border-white/30 hover:border-white/60 rounded-lg px-2 py-1 transition-colors"
                title="Stop generating"
              >
                ⏹ Stop
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50" style={{ minHeight: '280px' }}>
            {messages.length === 0 && (
              <p className="text-stone-400 text-sm text-center mt-8">
                👋 Hi! Ask me about grammar, vocabulary, idioms or anything English-related.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-navy text-white rounded-br-sm'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  {m.typing && <span className="animate-pulse">▌</span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-stone-200 bg-white flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask something..."
              rows={1}
              disabled={isBusy}
              className="flex-1 resize-none rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-navy transition-colors disabled:opacity-50"
            />
            {isBusy ? (
              <button
                onClick={stop}
                className="rounded-xl bg-red-500 text-white px-4 py-2 text-sm font-bold hover:bg-red-600 transition-colors"
              >
                ⏹
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="rounded-xl bg-navy text-white px-4 py-2 text-sm font-bold hover:bg-navy/90 transition-colors disabled:opacity-40"
              >
                Send
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
