import './globals.css';

export const metadata = {
  title: 'AI Chatbot SaaS',
  description: 'Multi-tenant AI website chatbot platform'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
