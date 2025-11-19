import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, DEMO_USER_EMAIL } from '../useAuth';
import { wrapper } from '@/test/utils/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:8000';

describe('useAuth', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with null user', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should login successfully', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.signIn('test@example.com', 'password');
        });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        expect(result.current.user?.email).toBe('test@example.com');
        expect(result.current.isDemoMode).toBe(false);
    });

    it('should detect demo mode', async () => {
        // Override handler to return demo user
        server.use(
            http.get(`${API_BASE_URL}/api/auth/me`, () => {
                return HttpResponse.json({
                    id: 'demo-user-123',
                    email: DEMO_USER_EMAIL,
                    role: 'member',
                    first_name: 'Demo',
                    last_name: 'User',
                    created_at: '2024-01-01T00:00:00Z',
                    subscription: {
                        plan: 'free',
                        status: 'active',
                        max_organizations: 1,
                        max_users_per_org: 1,
                        features: [],
                    },
                });
            })
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.signIn(DEMO_USER_EMAIL, 'password');
        });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        expect(result.current.user?.email).toBe(DEMO_USER_EMAIL);
        expect(result.current.isDemoMode).toBe(true);
    });

    it('should logout successfully', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // First login
        await act(async () => {
            await result.current.signIn('test@example.com', 'password');
        });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        // Then logout
        act(() => {
            result.current.signOut();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(localStorage.getItem('auth_token')).toBeNull();
    });
});
