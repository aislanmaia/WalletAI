import { render, screen } from '@/test/utils/test-utils';
import { RecentTransactions } from '../RecentTransactions';
import { describe, it, expect } from 'vitest';

describe('RecentTransactions', () => {
    const mockTransactions = [
        {
            id: '1',
            description: 'Supermercado',
            amount: -150.50,
            category: 'Alimentação',
            date: new Date('2024-01-15'),
            type: 'expense' as const,
            icon: 'shopping-cart',
        },
        {
            id: '2',
            description: 'Salário',
            amount: 5000.00,
            category: 'Renda',
            date: new Date('2024-01-05'),
            type: 'income' as const,
            icon: 'dollar-sign',
        },
    ];

    it('should render loading state', () => {
        const { container } = render(<RecentTransactions isLoading={true} transactions={[]} />);
        // Check for skeletons
        // The component renders 5 skeletons when loading
        // We can check if elements with 'animate-pulse' class exist
        const skeletons = container.querySelectorAll('.animate-pulse');
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render transactions', () => {
        render(<RecentTransactions isLoading={false} transactions={mockTransactions} />);

        expect(screen.getByText('Supermercado')).toBeInTheDocument();
        expect(screen.getByText('Salário')).toBeInTheDocument();
        expect(screen.getByText('Alimentação')).toBeInTheDocument();

        // Check amounts
        // Note: formatting might vary slightly depending on implementation details of formatCurrency
        // Using partial match for safety
        expect(screen.getByText(/150,50/)).toBeInTheDocument();
        expect(screen.getByText(/5\.000,00/)).toBeInTheDocument();
    });

    it('should render empty state', () => {
        render(<RecentTransactions isLoading={false} transactions={[]} />);

        expect(screen.getByText('Nenhuma transação encontrada')).toBeInTheDocument();
        expect(screen.getByText('Nova Transação')).toBeInTheDocument(); // CTA button
    });
});
