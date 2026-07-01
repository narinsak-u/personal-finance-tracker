import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM transactions`;
if (count > 0) {
  console.log(`Database has ${count} transactions — skipping seed`);
  await sql.end();
  process.exit(0);
}

console.log('Database is empty — seeding sample data...');

const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, '0');
const prev = (offset) => {
  const d = new Date(now);
  d.setDate(d.getDate() - offset);
  return d.toISOString().split('T')[0];
};

const transactions = [
  // Recent income (current month)
  { type: 'income', amount: 45000, category: 'salary', date: `${y}-${m}-01`, note: 'Monthly salary' },
  { type: 'income', amount: 200, category: 'other', date: prev(2) },
  // Recent expenses (last 2 weeks)
  { type: 'expense', amount: 450, category: 'food', date: prev(1), note: 'Weekly groceries' },
  { type: 'expense', amount: 2100, category: 'utilities', date: prev(3), note: 'Electric bill' },
  { type: 'expense', amount: 350, category: 'food', date: prev(5), note: 'Dinner out' },
  { type: 'expense', amount: 750, category: 'other', date: prev(7) },
  { type: 'expense', amount: 80, category: 'entertainment', date: prev(8), note: 'Streaming subscription' },
  { type: 'expense', amount: 2500, category: 'shopping', date: prev(10) },
  // Older income (last 2 months)
  { type: 'income', amount: 45000, category: 'salary', date: prev(32), note: 'Previous salary' },
  { type: 'income', amount: 1500, category: 'investment', date: prev(45) },
  { type: 'income', amount: 500, category: 'gift', date: prev(50), note: 'Birthday gift' },
  // Older expenses
  { type: 'expense', amount: 2200, category: 'utilities', date: prev(28), note: 'Electric bill' },
  { type: 'expense', amount: 390, category: 'food', date: prev(30), note: 'Weekly groceries' },
  { type: 'expense', amount: 1200, category: 'shopping', date: prev(35), note: 'Kitchen supplies' },
  { type: 'expense', amount: 310, category: 'food', date: prev(38), note: 'Weekly groceries' },
  { type: 'expense', amount: 600, category: 'entertainment', date: prev(40), note: 'Concert tickets' },
  { type: 'expense', amount: 800, category: 'other', date: prev(42) },
  { type: 'expense', amount: 3500, category: 'shopping', date: prev(48), note: 'New shoes' },
  { type: 'expense', amount: 280, category: 'food', date: prev(50), note: 'Dinner out' },
  { type: 'expense', amount: 420, category: 'food', date: prev(55), note: 'Weekly groceries' },
  { type: 'expense', amount: 350, category: 'food', date: prev(60) },
  { type: 'expense', amount: 150, category: 'entertainment', date: prev(62), note: 'Movie tickets' },
  // Expense only — no income — for the oldest month (covers 2-month span)
  { type: 'expense', amount: 1800, category: 'utilities', date: prev(65), note: 'Electric + water' },
  { type: 'expense', amount: 600, category: 'other', date: prev(68) },
  { type: 'expense', amount: 450, category: 'food', date: prev(70), note: 'Weekly groceries' },
];

for (const t of transactions) {
  await sql`
    INSERT INTO transactions (type, amount, category, date, note)
    VALUES (${t.type}, ${t.amount}, ${t.category}, ${t.date}, ${t.note ?? null})
  `;
}

console.log(`Seeded ${transactions.length} sample transactions`);
await sql.end();
