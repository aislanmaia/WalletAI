# Analytics Library Documentation

## Overview
The `analytics.ts` library provides client-side data processing for financial transactions. It transforms raw transaction data into insights, summaries, and visualizations.

**Location:** `src/lib/analytics.ts`

## Core Functions

### `processTransactionAnalytics(transactions: Transaction[])`
Main entry point that processes an array of transactions and returns comprehensive analytics.

**Returns:** `AnalyticsResult`
```typescript
{
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  expenseCategories: CategoryData[];
  moneyFlow: MoneyFlowData;
  weeklyExpenseHeatmap: WeekdayData[];
}
```

**Usage:**
```typescript
import { processTransactionAnalytics } from '@/lib/analytics';

const result = processTransactionAnalytics(transactions);
console.log('Balance:', result.summary.balance);
```

---

### `calculateSummary(transactions: Transaction[])`
Calculates financial summary metrics.

**Returns:** `FinancialSummary`
```typescript
{
  balance: number;           // Current balance (income - expenses)
  totalIncome: number;       // Sum of all income
  totalExpenses: number;     // Sum of all expenses (positive)
  savingsGoal?: number;      // Optional savings goal
  goalProgress?: number;     // Progress towards goal (0-100)
}
```

**Example:**
```typescript
const summary = calculateSummary(transactions);
// { balance: 5000, totalIncome: 10000, totalExpenses: 5000 }
```

---

### `groupByMonth(transactions: Transaction[])`
Groups transactions by month for time-series analysis.

**Returns:** `MonthlyData[]`
```typescript
[
  {
    month: 'Jan',
    income: 5000,
    expenses: 3000
  },
  // ...
]
```

**Details:**
- Processes last 6 months of data
- Groups by month name (Jan, Feb, etc.)
- Separates income vs expenses

---

### `groupByCategory(transactions: Transaction[])`
Aggregates expenses by category for distribution analysis.

**Returns:** `CategoryData[]`
```typescript
[
  {
    name: 'Alimentação',
    amount: 1500,
    percentage: 30
  },
  // ...
]
```

**Notes:**
- Only includes expense transactions
- Supports both legacy `category` field and new `tags` system
- Sorted by amount (descending)

---

### `generateMoneyFlow(transactions: Transaction[])`
Analyzes monthly cash flow patterns.

**Returns:** `MoneyFlowData`
```typescript
{
  avgMonthlyIncome: 5000,
  avgMonthlyExpenses: 3000,
  trend: 'positive' | 'negative' | 'stable'
}
```

**Trend logic:**
- `positive`: Net positive > R$500
- `negative`: Net negative < -R$500  
- `stable`: Between -R$500 and R$500

---

### `generateWeekdayHeatmap(transactions: Transaction[])`
Creates expense heatmap by day of week.

**Returns:** `WeekdayData[]`
```typescript
[
  { day: 'Dom', amount: 500 },
  { day: 'Seg', amount: 800 },
  // ...
]
```

**Use case:** Identify spending patterns by weekday

---

## Tag System Support

The library intelligently handles both legacy and new transaction formats:

**Legacy format:**
```typescript
{
  category: 'Alimentação',
  // ...
}
```

**New format (tags):**
```typescript
{
  tags: [
    { id: '1', name: 'Alimentação', type: 'Categoria' },
    { id: '2', name: 'Restaurante', type: 'Local' }
  ],
  // ...
}
```

**Category extraction logic:**
1. Check for `tags` array
2. Find tag with `type === 'Categoria'`
3. Fallback to `category` field
4. Default to 'Sem categoria'

---

## Helper Functions

### `getCategoryFromTransaction(transaction)`
Extracts the primary category from a transaction.

### `formatMonthName(date)`
Converts Date to short month name (Jan, Feb, etc.)

### `getDayOfWeek(date)`
Gets abbreviated day name (Dom, Seg, etc.)

---

## Performance Considerations

- **Client-side processing**: All analytics run in the browser
- **Memoization**: Results should be memoized in hooks (e.g., `useMemo`)
- **Data volume**: Tested with up to 1000 transactions
- **Optimization**: Minimize re-computation by only reprocessing when data changes

---

## Integration Example

```typescript
// In useFinancialData hook
import { processTransactionAnalytics } from '@/lib/analytics';

const analytics = useMemo(() => {
  if (!transactions) return null;
  return processTransactionAnalytics(transactions);
}, [transactions]);

return {
  summary: analytics?.summary || defaultSummary,
  monthlyData: analytics?.monthlyData || [],
  expenseCategories: analytics?.expenseCategories || [],
  // ...
};
```

---

## Future Enhancements

- [ ] Support for multiple currencies
- [ ] Predictive analytics (spending forecasts)
- [ ] Anomaly detection (unusual transactions)
- [ ] Budgeting insights
- [ ] Tax categorization
