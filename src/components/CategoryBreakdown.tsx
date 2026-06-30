import { formatCurrency } from '@/lib/format';
import { SummaryResponse } from '@/types/transaction';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CategoryBreakdown({
  byCategory,
}: {
  byCategory: SummaryResponse['byCategory'];
}) {
  const income = byCategory.filter(c => c.type === 'income');
  const expense = byCategory.filter(c => c.type === 'expense');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Income by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <p className="text-muted-foreground text-sm">No income in this period</p>
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
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {expense.length === 0 ? (
            <p className="text-muted-foreground text-sm">No expenses in this period</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
