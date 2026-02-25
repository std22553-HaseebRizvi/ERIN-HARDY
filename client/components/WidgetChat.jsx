'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/lib/api';

export default function WidgetChat({ tenantId }) {
  const [config, setConfig] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const visitorId = useMemo(() => {
    if (typeof window === 'undefined') return 'server';
    const existing = localStorage.getItem('visitorId');
    if (existing) return existing;
    const generated = crypto.randomUUID();
    localStorage.setItem('visitorId', generated);
    return generated;
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/chat/tenant/${tenantId}/config`)
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setMessages([{ role: 'assistant', content: data.welcomeMessage }]);
      });
  }, [tenantId]);

  async function sendMessage() {
    if (!input.trim() || !config?.online) return;
    const userMessage = { role: 'user', content: input };
    const next = [...messages, userMessage, { role: 'assistant', content: '' }];
    setMessages(next);
    setInput('');
    setTyping(true);

    const res = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, visitorId, message: userMessage.content, history: messages, sessionId })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));
      lines.forEach((line) => {
        const payload = JSON.parse(line.replace('data: ', ''));
        if (payload.token) {
          assistantText += payload.token;
          setMessages((prev) => {
            const cloned = [...prev];
            cloned[cloned.length - 1] = { role: 'assistant', content: assistantText };
            return cloned;
          });
        }
        if (payload.sessionId) setSessionId(payload.sessionId);
      });
    }

    setTyping(false);
  }

  return (
    <div className="h-full bg-white rounded-xl border border-slate-200 shadow-xl flex flex-col">
      <header className="p-3 text-white rounded-t-xl flex items-center justify-between" style={{ backgroundColor: config?.themeColor || '#2563eb' }}>
        <div>
          <p className="font-semibold">{config?.chatbotName || 'Assistant'}</p>
          <p className="text-xs opacity-90">{config?.online ? '● Online' : '● Offline'}</p>
        </div>
      </header>
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-slate-900 text-white ml-auto' : 'bg-slate-100'}`}>
            {m.content || (typing ? 'Typing…' : '')}
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <input className="flex-1 border rounded px-3 py-2 text-sm" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
        <button className="px-3 py-2 rounded text-white text-sm" style={{ backgroundColor: config?.themeColor || '#2563eb' }} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
