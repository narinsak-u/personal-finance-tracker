"use client";

import { PieChart, Pie, Cell, Label } from "recharts";
import { formatCurrency } from "@/lib/format";
import {
  expenseChartConfig,
  incomeChartConfig,
} from "@/lib/categories";
import type { ChartConfig } from "@/components/ui/chart";
import type { SummaryResponse } from "@/types/transaction";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function DonutChartCard({
  title,
  data,
  config,
  total,
  emptyMessage,
}: {
  title: string;
  data: Array<{ category: string; total: number }>;
  config: ChartConfig;
  total: number;
  emptyMessage: string;
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center gap-4">
        <ChartContainer
          config={config}
          className="aspect-square w-full max-h-[320px] min-h-[200px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={65}
              outerRadius={110}
              strokeWidth={2}
              label={false}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.category}`}
                  fill={`var(--color-${entry.category})`}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) - 4}
                          className="fill-muted-foreground text-xs"
                        >
                          Total
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy as number) + 16}
                          className="fill-foreground text-lg font-bold"
                        >
                          {formatCurrency(total)}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="w-full border-t pt-3 text-center">
          <span className="text-sm text-muted-foreground">
            Accumulating total:{" "}
          </span>
          <span className="text-sm font-semibold">{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoryBreakdown({
  byCategory,
}: {
  byCategory: SummaryResponse["byCategory"];
}) {
  const income = byCategory
    .filter((c) => c.type === "income")
    .map((c) => ({ category: c.category, total: c.total }));

  const expense = byCategory
    .filter((c) => c.type === "expense")
    .map((c) => ({ category: c.category, total: c.total }));

  const totalIncome = income.reduce((sum, c) => sum + c.total, 0);
  const totalExpense = expense.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <DonutChartCard
        title="Income by Category"
        data={income}
        config={incomeChartConfig}
        total={totalIncome}
        emptyMessage="No income in this period"
      />
      <DonutChartCard
        title="Expense by Category"
        data={expense}
        config={expenseChartConfig}
        total={totalExpense}
        emptyMessage="No expenses in this period"
      />
    </div>
  );
}
