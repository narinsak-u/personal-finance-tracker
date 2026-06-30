import { formatCurrency } from '@/lib/format';
import { SummaryResponse } from '@/types/transaction';

export default function CategoryBreakdown({
  byCategory,
}: {
  byCategory: SummaryResponse['byCategory'];
}) {
  const income = byCategory.filter(c => c.type === 'income');
  const expense = byCategory.filter(c => c.type === 'expense');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Income by Category</h3>
        {income.length === 0 ? (
          <p className="text-gray-400 text-sm">No income in this period</p>
        ) : (
          <ul className="space-y-2">
            {income.map(c => (
              <li key={`${c.type}-${c.category}`} className="flex justify-between">
                <span className="capitalize">{c.category}</span>
                <span className="font-medium text-green-600">{formatCurrency(c.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Expense by Category</h3>
        {expense.length === 0 ? (
          <p className="text-gray-400 text-sm">No expenses in this period</p>
        ) : (
          <ul className="space-y-2">
            {expense.map(c => (
              <li key={`${c.type}-${c.category}`} className="flex justify-between">
                <span className="capitalize">{c.category}</span>
                <span className="font-medium text-red-600">{formatCurrency(c.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
