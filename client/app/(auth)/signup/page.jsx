'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function SignupPage() {
  const [form, setForm] = useState({ companyName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/api/auth/signup', { method: 'POST', body: JSON.stringify(form) });
      localStorage.setItem('token', data.token);
      localStorage.setItem('tenant', JSON.stringify(data.tenant));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-3">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <input className="w-full border p-2 rounded" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white py-2 rounded">Signup</button>
      </form>
    </main>
  );
}
