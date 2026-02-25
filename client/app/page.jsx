export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-4xl font-bold">AI Website Chatbot SaaS</h1>
      <p className="text-slate-600">Deploy a multi-tenant chatbot for businesses in minutes.</p>
      <div className="card space-y-2">
        <h2 className="font-semibold">Quick Embed Script</h2>
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-sm">{`<script
  src="https://YOUR_BACKEND_DOMAIN/widget/chatbot.js"
  data-chatbot-id="TENANT_ID"
  data-chatbot-url="https://YOUR_FRONTEND_DOMAIN/widget"
  defer
></script>`}</pre>
      </div>
      <a href="/signup" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg">Get Started</a>
    </main>
  );
}
