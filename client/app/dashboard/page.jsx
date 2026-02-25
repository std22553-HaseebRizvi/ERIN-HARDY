'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, API_URL } from '@/lib/api';

export default function DashboardPage() {
  const [tenant, setTenant] = useState(null);
  const [analytics, setAnalytics] = useState({ messages: 0, leads: 0, sessions: 0 });
  const [leads, setLeads] = useState([]);
  const [kbText, setKbText] = useState('');
  const [status, setStatus] = useState('');

  const embedCode = useMemo(() => {
    if (!tenant?._id) return '';
    return `<script src="${API_URL}/widget/chatbot.js" data-chatbot-id="${tenant._id}" data-chatbot-url="${process.env.NEXT_PUBLIC_WIDGET_BASE_URL || 'http://localhost:3000/widget'}" defer></script>`;
  }, [tenant]);

  async function load() {
    const [me, stats, leadList] = await Promise.all([api('/api/admin/me'), api('/api/admin/analytics'), api('/api/admin/leads')]);
    setTenant(me);
    setAnalytics(stats);
    setLeads(leadList);
  }

  useEffect(() => {
    load().catch((e) => setStatus(e.message));
  }, []);

  async function saveSettings(e) {
    e.preventDefault();
    setStatus('Saving settings...');
    await api('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        chatbotName: tenant.chatbotName,
        welcomeMessage: tenant.welcomeMessage,
        themeColor: tenant.themeColor,
        online: tenant.online
      })
    });
    setStatus('Settings updated.');
  }

  async function addKnowledge() {
    await api('/api/knowledge/text', {
      method: 'POST',
      body: JSON.stringify({ title: `KB ${new Date().toISOString()}`, sourceType: 'text', rawText: kbText })
    });
    setKbText('');
    setStatus('Knowledge base uploaded.');
  }

  async function startCheckout(plan) {
    const data = await api('/api/billing/create-checkout-session', { method: 'POST', body: JSON.stringify({ plan }) });
    window.location.href = data.url;
  }

  if (!tenant) return <main className="p-8">Loading dashboard...</main>;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{tenant.companyName} Dashboard</h1>
      {status && <p className="text-sm text-slate-600">{status}</p>}

      <section className="grid sm:grid-cols-3 gap-4">
        <div className="card"><p className="text-sm text-slate-500">Messages</p><p className="text-2xl font-bold">{analytics.messages}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Leads</p><p className="text-2xl font-bold">{analytics.leads}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Conversations</p><p className="text-2xl font-bold">{analytics.sessions}</p></div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold text-lg">Chatbot Settings</h2>
        <form className="grid sm:grid-cols-2 gap-3" onSubmit={saveSettings}>
          <input className="border p-2 rounded" value={tenant.chatbotName || ''} onChange={(e) => setTenant({ ...tenant, chatbotName: e.target.value })} placeholder="Chatbot name" />
          <input className="border p-2 rounded" value={tenant.themeColor || ''} onChange={(e) => setTenant({ ...tenant, themeColor: e.target.value })} placeholder="#2563eb" />
          <textarea className="border p-2 rounded sm:col-span-2" rows={3} value={tenant.welcomeMessage || ''} onChange={(e) => setTenant({ ...tenant, welcomeMessage: e.target.value })} placeholder="Welcome message" />
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={tenant.online} onChange={(e) => setTenant({ ...tenant, online: e.target.checked })} /> Online status</label>
          <button className="bg-blue-600 text-white rounded px-3 py-2 sm:col-span-2">Save Settings</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold text-lg">Knowledge Base (FAQ/Text)</h2>
        <textarea rows={5} className="w-full border rounded p-2" value={kbText} onChange={(e) => setKbText(e.target.value)} placeholder="Paste FAQs, policy text, service details..." />
        <button className="bg-slate-900 text-white rounded px-3 py-2" onClick={addKnowledge}>Upload to KB</button>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold text-lg">Leads</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th>Name</th><th>Email</th><th>Phone</th><th>Date</th></tr></thead>
            <tbody>{leads.map((lead) => <tr key={lead._id} className="border-b"><td>{lead.name}</td><td>{lead.email}</td><td>{lead.phone}</td><td>{new Date(lead.createdAt).toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
        <a href={`${API_URL}/api/admin/chats/export.csv`} className="underline">Export chat logs CSV</a>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold text-lg">Billing Plans</h2>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-2 bg-slate-900 text-white rounded" onClick={() => startCheckout('basic')}>Basic (500)</button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => startCheckout('pro')}>Pro (2000)</button>
          <button className="px-3 py-2 bg-purple-600 text-white rounded" onClick={() => startCheckout('premium')}>Premium (Unlimited)</button>
        </div>
      </section>

      <section className="card space-y-2">
        <h2 className="font-semibold text-lg">Embed Script</h2>
        <pre className="bg-slate-900 text-slate-100 p-3 rounded overflow-auto text-xs">{embedCode}</pre>
      </section>
    </main>
  );
}
