// lib/goals-storage.ts
// Gerenciamento de metas usando localStorage (MVP)
// TODO: Migrar para endpoints do backend quando disponíveis

import { nanoid } from 'nanoid';

export interface Goal {
    id: string;
    organization_id: string;
    name: string;
    description?: string;
    target_amount: number;
    current_amount: number;
    target_date?: string; // ISO date string
    category?: string;
    created_at: string;
    updated_at: string;
}

export type CreateGoalInput = Omit<Goal, 'id' | 'current_amount' | 'created_at' | 'updated_at'>;
export type UpdateGoalInput = Partial<Omit<Goal, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>;

/**
 * Obtém a chave do localStorage para uma organização
 */
function getStorageKey(organizationId: string): string {
    return `goals_${organizationId}`;
}

/**
 * Carrega todas as metas de uma organização
 */
export function getGoals(organizationId: string): Goal[] {
    try {
        const key = getStorageKey(organizationId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading goals from localStorage:', error);
        return [];
    }
}

/**
 * Obtém uma meta específica por ID
 */
export function getGoalById(organizationId: string, goalId: string): Goal | null {
    const goals = getGoals(organizationId);
    return goals.find((g) => g.id === goalId) || null;
}

/**
 * Cria uma nova meta
 */
export function createGoal(organizationId: string, input: CreateGoalInput): Goal {
    const goals = getGoals(organizationId);

    const newGoal: Goal = {
        ...input,
        id: nanoid(),
        organization_id: organizationId,
        current_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const updated = [...goals, newGoal];
    localStorage.setItem(getStorageKey(organizationId), JSON.stringify(updated));

    return newGoal;
}

/**
 * Atualiza uma meta existente
 */
export function updateGoal(
    organizationId: string,
    goalId: string,
    input: UpdateGoalInput
): Goal | null {
    const goals = getGoals(organizationId);
    const index = goals.findIndex((g) => g.id === goalId);

    if (index === -1) {
        return null;
    }

    const updated = {
        ...goals[index],
        ...input,
        updated_at: new Date().toISOString(),
    };

    goals[index] = updated;
    localStorage.setItem(getStorageKey(organizationId), JSON.stringify(goals));

    return updated;
}

/**
 * Adiciona progresso a uma meta
 */
export function addProgressToGoal(
    organizationId: string,
    goalId: string,
    amount: number
): Goal | null {
    const goal = getGoalById(organizationId, goalId);
    if (!goal) {
        return null;
    }

    return updateGoal(organizationId, goalId, {
        current_amount: goal.current_amount + amount,
    });
}

/**
 * Deleta uma meta
 */
export function deleteGoal(organizationId: string, goalId: string): boolean {
    const goals = getGoals(organizationId);
    const filtered = goals.filter((g) => g.id !== goalId);

    if (filtered.length === goals.length) {
        return false; // Meta não encontrada
    }

    localStorage.setItem(getStorageKey(organizationId), JSON.stringify(filtered));
    return true;
}

/**
 * Calcula progresso percentual de uma meta
 */
export function calculateProgress(goal: Goal): number {
    if (goal.target_amount <= 0) {
        return 0;
    }
    return Math.min(100, (goal.current_amount / goal.target_amount) * 100);
}

/**
 * Calcula dias restantes até a data alvo
 */
export function getDaysRemaining(goal: Goal): number | null {
    if (!goal.target_date) {
        return null;
    }

    const target = new Date(goal.target_date);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Calcula valor necessário por mês para atingir meta
 */
export function getMonthlyRequiredAmount(goal: Goal): number | null {
    const daysRemaining = getDaysRemaining(goal);
    if (daysRemaining === null || daysRemaining <= 0) {
        return null;
    }

    const remaining = goal.target_amount - goal.current_amount;
    if (remaining <= 0) {
        return 0;
    }

    const monthsRemaining = daysRemaining / 30;
    return remaining / monthsRemaining;
}

/**
 * Exporta todas as funções em um objeto para facilitar uso
 */
export const goalsStorage = {
    getAll: getGoals,
    getById: getGoalById,
    create: createGoal,
    update: updateGoal,
    delete: deleteGoal,
    addProgress: addProgressToGoal,
    calculateProgress,
    getDaysRemaining,
    getMonthlyRequiredAmount,
};
