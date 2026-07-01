export default function Loading() {
  return (
    <main className="max-w-4xl mx-auto p-4 animate-pulse">
      <h1 className="text-2xl font-bold mb-6">Personal Finance Tracker</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="h-20 rounded-lg border bg-card" />
        <div className="h-20 rounded-lg border bg-card" />
        <div className="h-20 rounded-lg border bg-card" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-[360px] rounded-lg border bg-card" />
        <div className="h-[360px] rounded-lg border bg-card" />
      </div>
      <div className="h-[400px] rounded-lg border bg-card" />
    </main>
  );
}