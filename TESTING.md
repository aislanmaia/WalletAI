# Testing Guide

## Overview
This project uses **Vitest** and **Mock Service Worker (MSW)** for unit and integration testing. This document explains how to run tests, write new tests, and understand the testing infrastructure.

## Running Tests

```bash
# Run all tests once
npm run test:unit

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Setup Files
- **`vitest.config.ts`**: Main Vitest configuration
- **`src/test/setup.ts`**: Global test setup, browser API mocks, MSW initialization
- **`src/test/utils/test-utils.tsx`**: Custom render function with providers

### Mock API with MSW
We use MSW to intercept HTTP requests and return mock responses during tests.

**Files:**
- `src/test/mocks/handlers.ts`: API endpoint handlers with mock data
- `src/test/mocks/server.ts`: MSW server setup for Node.js

**Example handler:**
```typescript
export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string };
    if (body.email === 'demo@walletai.app') {
      return HttpResponse.json(mockDemoUser);
    }
    return HttpResponse.json(mockUser);
  }),
];
```

### Test Utilities
The `test-utils.tsx` file provides a custom `render` function that wraps components with necessary providers:

```typescript
import { render } from '@/test/utils/test-utils';

test('renders component', () => {
  render(<MyComponent />);
  // assertions...
});
```

**Providers included:**
- `QueryClientProvider` for React Query
- Custom test `QueryClient` with disabled retries for faster tests

## Writing Tests

### Hook Tests
Location: `src/hooks/__tests__/`

Example:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { wrapper } from '@/test/utils/test-utils';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should detect demo mode', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.signIn('demo@walletai.app', 'password');
    });

    await waitFor(() => {
      expect(result.current.isDemoMode).toBe(true);
    });
  });
});
```

### Component Tests
Location: `src/components/__tests__/`

Example:
```typescript
import { render, screen } from '@/test/utils/test-utils';
import { SummaryCards } from '../SummaryCards';

describe('SummaryCards', () => {
  it('renders loading state', () => {
    render(<SummaryCards summary={mockSummary} isLoading />);
    expect(screen.getAllByRole('status')).toHaveLength(4);
  });

  it('renders data correctly', () => {
    render(<SummaryCards summary={mockSummary} isLoading={false} />);
    expect(screen.getByText(/Saldo Atual/i)).toBeInTheDocument();
  });
});
```

## Test Coverage

Current coverage (as of last run):
- **Hooks**: `useAuth`, `useOrganization`, `useFinancialData`
- **Components**: `SummaryCards`, `RecentTransactions`

**Test count:** 18 tests passing

## Best Practices

1. **Use MSW for API mocking** - Don't mock modules directly
2. **Test user behavior, not implementation** - Focus on what users see/do
3. **Keep tests isolated** - Each test should be independent
4. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
5. **Wait for async updates** - Use `waitFor` and `findBy` queries for async operations

## Debugging Tests

```bash
# Run a specific test file
npm run test:unit src/hooks/__tests__/useAuth.test.tsx

# Run tests matching a pattern
npm run test:unit -t "demo mode"

# Show verbose output
npm run test:unit -- --reporter=verbose
```

## CI/CD Integration

Tests can be integrated into your CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm run test:unit

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

## Future Improvements

- [ ] Add integration tests for complete user flows
- [ ] Increase coverage to 80%+ on critical paths
- [ ] Add E2E tests with Playwright
- [ ] Set up visual regression testing
