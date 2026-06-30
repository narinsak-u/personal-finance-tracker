import * as summaryService from '@/services/summaryService';
import * as transactionService from '@/services/transactionService';

export const dynamic = 'force-dynamic';
import SummaryCards from '@/components/SummaryCards';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0];
  const to = now.toISOString().split('T')[0];

  const [summary, transactions] = await Promise.all([
    summaryService.getSummary(from, to),
    transactionService.list({}),
  ]);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Personal Finance Tracker</h1>
      <p className="text-sm text-gray-500 mb-4">
        Summary for {from} to {to}
      </p>
      <SummaryCards summary={summary} />
      <CategoryBreakdown byCategory={summary.byCategory} />
      <Dashboard initialTransactions={transactions} />
    </main>
  );
}
