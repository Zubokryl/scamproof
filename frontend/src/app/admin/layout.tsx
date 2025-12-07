'use client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-indigo-900">
      <main className="flex-grow container mx-auto px-4">
        {children}
      </main>
    </div>
  );
}