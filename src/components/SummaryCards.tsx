import { formatCurrency } from '@/lib/format';
import { SummaryResponse } from '@/types/transaction';

export default function SummaryCards({ summary }: { summary: SummaryResponse }) {
  const isPositive = summary.netBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Income</h3>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(summary.totalIncome)}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Total Expense</h3>
        <p className="text-2xl font-bold text-red-600">
          {formatCurrency(summary.totalExpense)}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-1">Net Balance</h3>
        <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(summary.netBalance)}
        </p>
      </div>
    </div>
  );
}
