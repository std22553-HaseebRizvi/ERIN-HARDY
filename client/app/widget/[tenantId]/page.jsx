import WidgetChat from '@/components/WidgetChat';

export default async function WidgetPage({ params }) {
  const { tenantId } = await params;
  return (
    <main className="h-screen w-screen p-2 bg-transparent">
      <WidgetChat tenantId={tenantId} />
    </main>
  );
}
