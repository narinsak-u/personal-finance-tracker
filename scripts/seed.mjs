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

const transactions = [
  { type: 'income', amount: 45000, category: 'salary', date: '2026-04-01', note: 'April salary' },
  { type: 'income', amount: 45000, category: 'salary', date: '2026-05-01', note: 'May salary' },
  { type: 'income', amount: 45000, category: 'salary', date: '2026-06-01', note: 'June salary' },
  { type: 'income', amount: 1500, category: 'investment', date: '2026-04-15' },
  { type: 'income', amount: 1200, category: 'investment', date: '2026-05-20' },
  { type: 'income', amount: 500, category: 'gift', date: '2026-05-10', note: 'Birthday gift' },
  { type: 'income', amount: 200, category: 'other', date: '2026-06-05' },
  { type: 'expense', amount: 350, category: 'food', date: '2026-04-03', note: 'Weekly groceries' },
  { type: 'expense', amount: 420, category: 'food', date: '2026-04-10', note: 'Weekly groceries' },
  { type: 'expense', amount: 280, category: 'food', date: '2026-04-18', note: 'Dinner out' },
  { type: 'expense', amount: 390, category: 'food', date: '2026-05-02', note: 'Weekly groceries' },
  { type: 'expense', amount: 310, category: 'food', date: '2026-05-15', note: 'Weekly groceries' },
  { type: 'expense', amount: 450, category: 'food', date: '2026-06-07', note: 'Weekly groceries' },
  { type: 'expense', amount: 2200, category: 'utilities', date: '2026-04-05', note: 'Electric bill' },
  { type: 'expense', amount: 1800, category: 'utilities', date: '2026-05-05', note: 'Electric + water' },
  { type: 'expense', amount: 2100, category: 'utilities', date: '2026-06-05' },
  { type: 'expense', amount: 150, category: 'entertainment', date: '2026-04-12', note: 'Movie tickets' },
  { type: 'expense', amount: 600, category: 'entertainment', date: '2026-05-22', note: 'Concert tickets' },
  { type: 'expense', amount: 80, category: 'entertainment', date: '2026-06-10', note: 'Streaming subscription' },
  { type: 'expense', amount: 3500, category: 'shopping', date: '2026-04-20', note: 'New shoes' },
  { type: 'expense', amount: 1200, category: 'shopping', date: '2026-05-08', note: 'Kitchen supplies' },
  { type: 'expense', amount: 2500, category: 'shopping', date: '2026-06-12' },
  { type: 'expense', amount: 800, category: 'other', date: '2026-04-08', note: 'BTS top-up' },
  { type: 'expense', amount: 600, category: 'other', date: '2026-05-12', note: 'Fuel' },
  { type: 'expense', amount: 750, category: 'other', date: '2026-06-08' },
];

for (const t of transactions) {
  await sql`
    INSERT INTO transactions (type, amount, category, date, note)
    VALUES (${t.type}, ${t.amount}, ${t.category}, ${t.date}, ${t.note ?? null})
  `;
}

console.log(`Seeded ${transactions.length} sample transactions`);
await sql.end();
